package com.muslim.adhkar.wird;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;

import androidx.core.app.NotificationCompat;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Calendar;
import java.util.Locale;
import java.util.TimeZone;

/**
 * الجدولة الدائمة للإشعارات على أندرويد.
 *
 * المشكلة التي تحلّها هذه الطبقة:
 *  - الإشعارات المجدولة عبر JavaScript (LocalNotifications) تُجدول لمدى محدود
 *    (15-30 يوماً) وتحتاج فتح التطبيق لتتجدّد، فتتوقف بعد أيام.
 *  - بيانات الودجات (مواقيت الصلاة) كانت تُدفع من الواجهة فقط، فتظهر
 *    "افتح التطبيق لتحديث المواقيت" بعد انقضاء اليوم.
 *
 * الحل:
 *  1) سلسلة مؤقّتات ذاتية التتابع: كل إشعار يُجدول عند إطلاقه، فيبقى العمل
 *     مستمراً بلا فتح التطبيق (نفس نمط DuaScheduler الموجود أصلاً).
 *  2) مؤقّت "تجديد يومي" عند凌晨 00:05 يعيد بناء كل الجدولة ويحدّث مواقيت
 *     الودج��ت — فيبقى كل شيء صحيحاً للأبد.
 *  3) مواقيت الصلاة تُحسب أصلياً (PrayerTimesCalc) فلا تحتاج الواجهة إطلاقاً.
 */
final class NativeScheduler {

    private static final String PREFS = "adhkar_native_sched_v1";
    private static final String KEY_CFG = "cfg";
    private static final String ACTION_FIRE = "com.muslim.adhkar.wird.NATIVE_SCHED_FIRE";

    static final String EXTRA_KIND = "kind";
    static final String EXTRA_TITLE = "title";
    static final String EXTRA_BODY = "body";
    static final String EXTRA_NAME = "name";
    static final String EXTRA_WHEN = "when";

    // أنواع الأحداث (تُستخدم أيضاً كمعرّفات للمؤقّتات)
    static final String KIND_MORNING = "adhkar-morning";
    static final String KIND_EVENING = "adhkar-evening";
    static final String KIND_PERIODIC = "adhkar-periodic";
    static final String KIND_QIYAM = "adhkar-qiyam";
    static final String KIND_ADHAN = "prayer-adhan";
    static final String KIND_REMINDER = "prayer-reminder";
    static final String KIND_OWABIN = "prayer-owabin";
    static final String KIND_TAHajjud = "prayer-tahajjud";

    // معرّفات المؤقّتات (ثابتة ⇒ إعادة الجدولة تستبدل السابقة)
    private static final int RC_MORNING = 4101;
    private static final int RC_EVENING = 4102;
    private static final int RC_PERIODIC = 4103;
    private static final int RC_QIYAM = 4104;
    private static final int RC_ADHAN_BASE = 4200;
    private static final int RC_REMINDER_BASE = 4210;
    private static final int RC_OWABIN = 4220;
    private static final int RC_TAHajjud = 4221;
    private static final int RC_ROLLOVER = 4300;

    // قنوات الإشعارات (نفس المعرّفات التي تستخدمها الواجهة)
    static final String CH_ADHKAR = "adhkar-morning-evening";
    static final String CH_PRAYER = "prayer-times";
    static final String CH_ADHAN = "prayer-adhan";

    private static final String WAKE_START = "06:45";
    private static final String WAKE_END = "21:15";

    private NativeScheduler() {
    }

    /* ════════════════ التخزين ════════════════ */

    /** يدمج الإعدادات الجديدة مع المحفوظة (لا يمسح القسم الآخر). */
    static void saveConfig(Context ctx, JSONObject adhkar, JSONObject prayer) {
        try {
            JSONObject cfg = loadConfig(ctx);
            if (adhkar != null) cfg.put("adhkar", adhkar);
            if (prayer != null) cfg.put("prayer", prayer);
            ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                    .edit().putString(KEY_CFG, cfg.toString()).apply();
        } catch (JSONException ignored) {
        }
    }

    static JSONObject loadConfig(Context ctx) {
        try {
            String raw = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_CFG, "{}");
            return new JSONObject(raw);
        } catch (JSONException e) {
            return new JSONObject();
        }
    }

    private static JSONObject section(Context ctx, String name) {
        JSONObject cfg = loadConfig(ctx);
        JSONObject sec = cfg.optJSONObject(name);
        return sec != null ? sec : new JSONObject();
    }

    /* ════════════════ الإعداد الكامل ════════════════ */

    /** يحفظ الإعدادات ويبني الجدولة من جديد. */
    static void configure(Context ctx, JSONObject adhkar, JSONObject prayer) {
        Context app = ctx.getApplicationContext();
        saveConfig(app, adhkar, prayer);
        rescheduleAll(app);
    }

    /** يعيد بناء كل المؤقّتات من الصفر (يُستدعى عند الإقلاع وتغيّر التاريخ). */
    static void rescheduleAll(Context ctx) {
        Context app = ctx.getApplicationContext();
        ensureChannels(app);
        // لا جدولة بلا إذن الإشعارات (أندرويد 13+)
        if (!canPostNotifications(app)) {
            pushTimesToWidget(app);
            return;
        }
        scheduleAdhkarChain(app);
        schedulePrayerChain(app);
        scheduleRollover(app);
        pushTimesToWidget(app);
        refreshWidgets(app);
    }

    /** هل يسمح النظام بعرض الإشعارات؟ */
    static boolean canPostNotifications(Context ctx) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            return nm == null || nm.areNotificationsEnabled();
        }
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        return nm != null && nm.areNotificationsEnabled();
    }

    /* ════════════════ سلسلة أذكار الصباح/المساء/الدوري/قيام الليل ════════════════ */

    private static void scheduleAdhkarChain(Context ctx) {
        JSONObject cfg = section(ctx, "adhkar");
        boolean enabled = cfg.optBoolean("enabled", false);
        String morningTime = cfg.optString("morningTime", "06:30");
        String eveningTime = cfg.optString("eveningTime", "17:30");
        int interval = Math.min(240, Math.max(5, cfg.optInt("intervalMinutes", 60)));
        boolean qiyamEnabled = cfg.optBoolean("qiyamEnabled", false);
        String qiyamTime = cfg.optString("qiyamTime", "03:00");

        cancel(ctx, RC_MORNING);
        cancel(ctx, RC_EVENING);
        cancel(ctx, RC_PERIODIC);
        cancel(ctx, RC_QIYAM);

        if (!enabled) return;

        long now = System.currentTimeMillis();
        // هامش صغير جداً: يمنع تخطّي تذكير وشيك عند فتح التطبيق قبله بلحظة
        long after = now + 1_000L;

        // الصباح — يتكرّر يومياً
        long morningAt = nextTimeOfDay(morningTime, after);
        if (morningAt > 0) {
            String text = pick(cfg.optJSONArray("morningPool"), dayIndex(now));
            schedule(ctx, RC_MORNING, morningAt, KIND_MORNING, "أذكار الصباح ☀️", text);
        }

        // المساء — يتكرّر يومياً
        long eveningAt = nextTimeOfDay(eveningTime, after);
        if (eveningAt > 0) {
            String text = pick(cfg.optJSONArray("eveningPool"), dayIndex(now) * 7);
            schedule(ctx, RC_EVENING, eveningAt, KIND_EVENING, "أذكار المساء 🌙", text);
        }

        // الدوري — يتكرّر ضمن ساعات الاستيقاظ
        long periodicAt = nextPeriodic(after, interval, morningTime, eveningTime);
        if (periodicAt > 0) {
            String text = pick(cfg.optJSONArray("periodicPool"), (int) ((now / 60000L) % 997L));
            schedule(ctx, RC_PERIODIC, periodicAt, KIND_PERIODIC, "لحظة ذكر وطمأنينة ✨", text);
        }

        // قيام الليل — قبل الموعد بنصف ساعة
        if (qiyamEnabled) {
            long qiyamAt = nextTimeOfDay(shiftHM(qiyamTime, -30), after);
            if (qiyamAt > 0) {
                schedule(ctx, RC_QIYAM, qiyamAt, KIND_QIYAM, "مفاتيح قيام الليل 🔑",
                        "بعد نصف ساعة يقوم الله لنفسه عبادُهُ الصالحون. ابدأ بها عشراً عشراً: الله أكبر، الحمد لله، "
                                + "سبحان الله وبحمده، سبحان الملك القدوس، الاستغفار، لا إله إلا الله، وأعذ بالله من ضيق الدنيا ويوم القيامة.");
            }
        }
    }

    /* ════════════════ سلسلة مواقيت الصلاة ════════════════ */

    private static void schedulePrayerChain(Context ctx) {
        JSONObject cfg = section(ctx, "prayer");
        boolean enabled = cfg.optBoolean("enabled", false);
        if (!enabled) {
            for (int i = 0; i < 5; i++) {
                cancel(ctx, RC_ADHAN_BASE + i);
                cancel(ctx, RC_REMINDER_BASE + i);
            }
            cancel(ctx, RC_OWABIN);
            cancel(ctx, RC_TAHajjud);
            return;
        }

        PrayerTimesCalc.Params params = buildParams(cfg);
        double lat = cfg.optDouble("lat", 30.0444);
        double lng = cfg.optDouble("lng", 31.2357);
        TimeZone tz = TimeZone.getTimeZone(cfg.optString("tz", "Africa/Cairo"));

        JSONObject adhanPerPrayer = cfg.optJSONObject("adhanPerPrayer");
        boolean adhanEnabled = cfg.optBoolean("adhanEnabled", true);
        boolean reminderEnabled = cfg.optBoolean("reminderEnabled", true);
        int lead = cfg.optInt("reminderLead", 10);

        String[] names = { "fajr", "dhuhr", "asr", "maghrib", "isha" };
        String[] arabic = { "الفجر", "الظهر", "العصر", "المغرب", "العشاء" };

        long now = System.currentTimeMillis();

        // نحسب مواقيت اليوم والغد مرة واحدة فقط (أداء أفضل من الحساب لكل صلاة)
        Calendar base = Calendar.getInstance(tz);
        base.clear();
        int[] wall = wallDate(now, tz);
        base.set(wall[0], wall[1] - 1, wall[2], 12, 0, 0);
        int[][] days = new int[2][3];
        PrayerTimesCalc.Times[] byDay = new PrayerTimesCalc.Times[2];
        for (int d = 0; d < 2; d++) {
            Calendar c = Calendar.getInstance(tz);
            c.clear();
            c.set(wall[0], wall[1] - 1, wall[2], 12, 0, 0);
            c.add(Calendar.DAY_OF_MONTH, d);
            int y = c.get(Calendar.YEAR);
            int m = c.get(Calendar.MONTH) + 1;
            int dd = c.get(Calendar.DAY_OF_MONTH);
            days[d][0] = y;
            days[d][1] = m;
            days[d][2] = dd;
            byDay[d] = PrayerTimesCalc.compute(y, m, dd, lat, lng, params, tz);
        }

        for (int i = 0; i < names.length; i++) {
            cancel(ctx, RC_ADHAN_BASE + i);
            cancel(ctx, RC_REMINDER_BASE + i);

            String wallTime = null;
            int dayIdx = -1;
            for (int d = 0; d < 2; d++) {
                String w = wallOf(byDay[d], names[i]);
                if (w == null || w.contains("--")) continue;
                long inst = PrayerTimesCalc.zonedToUtcMillis(days[d][0], days[d][1], days[d][2], w, tz);
                // هامش صغير: يمنع تخطّي صلاة وشكة عند إعادة الجدولة قبلها بلحظة
                if (inst > now + 1_000L) {
                    wallTime = w;
                    dayIdx = d;
                    break;
                }
            }
            if (dayIdx < 0) continue;

            long instant = PrayerTimesCalc.zonedToUtcMillis(days[dayIdx][0], days[dayIdx][1], days[dayIdx][2],
                    wallTime, tz);

            if (adhanEnabled && (adhanPerPrayer == null || adhanPerPrayer.optBoolean(names[i], true))) {
                schedule(ctx, RC_ADHAN_BASE + i, instant, KIND_ADHAN,
                        "حان موعد أذان " + arabic[i], null, names[i], instant);
            }
            // وضع عدم الإزعاج بعد انتهاء الأذان (حتى لو كانت نغمة الأذان موقوفة)
            DndController.scheduleForPrayer(ctx, names[i], instant);
            if (reminderEnabled && lead > 0) {
                long remAt = instant - lead * 60_000L;
                if (remAt > now) {
                    schedule(ctx, RC_REMINDER_BASE + i, remAt, KIND_REMINDER,
                            "اقترب موعد صلاة " + arabic[i],
                            "أذان " + arabic[i] + " في " + wallTime + " — متبقي " + lead + " دقائق", names[i], remAt);
                }
            }
        }

        // الأوابين والثلث الأخير
        cancel(ctx, RC_OWABIN);
        cancel(ctx, RC_TAHajjud);
        if (cfg.optBoolean("owabinReminder", true) && reminderEnabled) {
            Moment m = pickMoment(byDay, days, tz, "owabin", now);
            if (m != null) {
                schedule(ctx, RC_OWABIN, m.instant, KIND_OWABIN, "حانت صلاة الأوابين (الضحى)",
                        "وقت صلاة الأوابين الآن " + m.wall + " — قبل الظهر بساعة", null, m.instant);
            }
        }
        if (cfg.optBoolean("tahajjudReminder", true) && reminderEnabled) {
            Moment m = pickMoment(byDay, days, tz, "lastThird", now);
            if (m != null) {
                schedule(ctx, RC_TAHajjud, m.instant, KIND_TAHajjud, "قام ليلك 🌙",
                        "حان الآن الثلث الأخير من الليل — وقت قيام الليل والدعاء قبل الفجر", null, m.instant);
            }
        }
    }

    /** يختار أقرب موعد قادم (اليوم أو الغد) لصلاة معيّنة. */
    private static Moment pickMoment(PrayerTimesCalc.Times[] byDay, int[][] days, TimeZone tz, String name,
            long now) {
        for (int d = 0; d < byDay.length; d++) {
            PrayerTimesCalc.Times t = byDay[d];
            if (t == null) continue;
            String wall;
            if ("owabin".equals(name)) {
                wall = t.owabin;
            } else if ("lastThird".equals(name)) {
                wall = t.lastThird;
            } else {
                wall = wallOf(t, name);
            }
            if (wall == null || wall.contains("--")) continue;
            long inst = PrayerTimesCalc.zonedToUtcMillis(days[d][0], days[d][1], days[d][2], wall, tz);
            if (inst > now + 1_000L) return new Moment(days[d][0], days[d][1], days[d][2], wall, inst);
        }
        return null;
    }

    /** موعد جداري (تاريخ + وقت + لحظة مطلقة). */
    private static final class Moment {
        final int year;
        final int month;
        final int day;
        final String wall;
        final long instant;

        Moment(int year, int month, int day, String wall, long instant) {
            this.year = year;
            this.month = month;
            this.day = day;
            this.wall = wall;
            this.instant = instant;
        }
    }

    private static String wallOf(PrayerTimesCalc.Times t, String name) {
        if ("fajr".equals(name)) return t.fajr;
        if ("dhuhr".equals(name)) return t.dhuhr;
        if ("asr".equals(name)) return t.asr;
        if ("maghrib".equals(name)) return t.maghrib;
        if ("isha".equals(name)) return t.isha;
        return null;
    }

    /** يبني معاملات الحساب من إعدادات الواجهة. */
    private static PrayerTimesCalc.Params buildParams(JSONObject cfg) {
        PrayerTimesCalc.Params p = MethodMap.build(cfg.optString("method", "egypt"));
        p.hanafi = "hanafi".equals(cfg.optString("asr", "standard"));
        String high = cfg.optString("highLats", "recommended");
        if (high != null && !high.isEmpty()) p.highLat = high;
        if ("custom".equals(cfg.optString("method", "egypt"))) {
            p.fajrAngle = cfg.optDouble("fajrAngle", 19.5);
            p.ishaAngle = cfg.optDouble("ishaAngle", 17.5);
        }
        return p;
    }

    /* ════════════════ تغذية الودجات ════════════════ */

    /**
     * يعيد رسم كل الودجات على الشاشة الرئيسية — يعمل يومياً من المجدول
     * الأصلي فلا تحتاج لفتح التطبيق لتحديث البيانات.
     */
    static void refreshWidgets(Context ctx) {
        try {
            PrayerWidgetUpdater.renderAll(ctx);
        } catch (Exception ignored) {
        }
        try {
            CounterWidgetStore.renderAll(ctx);
        } catch (Exception ignored) {
        }
        try {
            HomeAdhkarProvider.renderAll(ctx);
        } catch (Exception ignored) {
        }
    }

    /** يدفع مواقيت اليوم المحسوبة أصلياً إلى ودجد الصلاة القادمة. */
    static void pushTimesToWidget(Context ctx) {
        JSONObject cfg = section(ctx, "prayer");
        if (!cfg.optBoolean("enabled", false)) return;
        try {
            PrayerTimesCalc.Params params = buildParams(cfg);
            double lat = cfg.optDouble("lat", 30.0444);
            double lng = cfg.optDouble("lng", 31.2357);
            TimeZone tz = TimeZone.getTimeZone(cfg.optString("tz", "Africa/Cairo"));
            // المواقيت تُحسب لتاريخ الموقع (منطقة زمنية الموقع)
            int[] ymd = wallDate(System.currentTimeMillis(), tz);
            PrayerTimesCalc.Times t = PrayerTimesCalc.compute(ymd[0], ymd[1], ymd[2], lat, lng, params, tz);
            JSONObject times = new JSONObject();
            times.put("fajr", t.fajr);
            times.put("sunrise", t.sunrise);
            times.put("dhuhr", t.dhuhr);
            times.put("asr", t.asr);
            times.put("maghrib", t.maghrib);
            times.put("isha", t.isha);
            times.put("imsak", t.fajr);
            times.put("owabin", t.owabin);
            times.put("midnight", t.midnight);
            times.put("lastThird", t.lastThird);
            // تاريخ الجهاز (نفس ما تتوقّعه ودجة الصلاة لمقارنة تاريخ صلاحيتها)
            int[] local = wallDate(System.currentTimeMillis(), TimeZone.getDefault());
            String date = String.format(Locale.US, "%04d-%02d-%02d", local[0], local[1], local[2]);
            PrayerWidgetUpdater.storeTimes(ctx, date, times);
        } catch (JSONException ignored) {
        }
    }

    /* ════════════════ المؤقّتات ════════════════ */

    /** مؤقّت التجديد اليومي — يعيد بناء كل شيء ويحدّث الودجات. */
    private static void scheduleRollover(Context ctx) {
        long now = System.currentTimeMillis();
        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(now);
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 5);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        if (c.getTimeInMillis() <= now) c.add(Calendar.DAY_OF_MONTH, 1);
        schedule(ctx, RC_ROLLOVER, c.getTimeInMillis(), "rollover", null, null);
    }

    static void schedule(Context ctx, int requestCode, long at, String kind, String title, String body) {
        schedule(ctx, requestCode, at, kind, title, body, null, at);
    }

    static void schedule(Context ctx, int requestCode, long at, String kind, String title, String body,
            String name, long when) {
        if (at <= 0) return;
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        Intent intent = new Intent(ctx, NativeAlarmReceiver.class).setAction(ACTION_FIRE);
        intent.putExtra(EXTRA_KIND, kind);
        intent.putExtra(EXTRA_TITLE, title);
        intent.putExtra(EXTRA_BODY, body);
        intent.putExtra(EXTRA_NAME, name);
        intent.putExtra(EXTRA_WHEN, when);
        PendingIntent pi = PendingIntent.getBroadcast(ctx, requestCode, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && am.canScheduleExactAlarms()) {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
            } else {
                am.set(AlarmManager.RTC_WAKEUP, at, pi);
            }
        } catch (SecurityException ignored) {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
        }
    }

    static void cancel(Context ctx, int requestCode) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        Intent intent = new Intent(ctx, NativeAlarmReceiver.class).setAction(ACTION_FIRE);
        PendingIntent pi = PendingIntent.getBroadcast(ctx, requestCode, intent,
                PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE);
        if (pi != null) {
            am.cancel(pi);
            pi.cancel();
        }
    }

    /* ════════════════ أدوات مساعدة ════════════════ */

    /** يحوّل لحظة مطلقة إلى "HH:MM" بساعة الجهاز (للتشخيص والاختبار). */
    static String hm(long millis) {
        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(millis);
        return String.format(Locale.US, "%02d:%02d", c.get(Calendar.HOUR_OF_DAY), c.get(Calendar.MINUTE));
    }

    /** nearest upcoming occurrence of HH:MM (device local time), 0 if invalid. */
    static long nextTimeOfDay(String hhmm, long now) {        int minutes = minutesOf(hhmm);
        if (minutes < 0) return 0L;
        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(now);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        if (c.get(Calendar.HOUR_OF_DAY) * 60 + c.get(Calendar.MINUTE) < minutes) {
            c.set(Calendar.HOUR_OF_DAY, minutes / 60);
            c.set(Calendar.MINUTE, minutes % 60);
            return c.getTimeInMillis();
        }
        c.add(Calendar.DAY_OF_YEAR, 1);
        c.set(Calendar.HOUR_OF_DAY, minutes / 60);
        c.set(Calendar.MINUTE, minutes % 60);
        return c.getTimeInMillis();
    }

    /** next slot within waking hours, skipping morning/evening slots. */
    static long nextPeriodic(long now, int intervalMinutes, String morningTime, String eveningTime) {
        if (intervalMinutes <= 0) return -1;
        int start = minutesOf(WAKE_START);
        int end = minutesOf(WAKE_END);
        int m = minutesOf(morningTime);
        int e = minutesOf(eveningTime);

        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(now);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        int todayNow = c.get(Calendar.HOUR_OF_DAY) * 60 + c.get(Calendar.MINUTE);

        for (int t = start; t <= end; t += intervalMinutes) {
            if (t == m || t == e) continue;
            if (t > todayNow) {
                c.set(Calendar.HOUR_OF_DAY, t / 60);
                c.set(Calendar.MINUTE, t % 60);
                return c.getTimeInMillis();
            }
        }
        c.add(Calendar.DAY_OF_YEAR, 1);
        for (int t = start; t <= end; t += intervalMinutes) {
            if (t == m || t == e) continue;
            c.set(Calendar.HOUR_OF_DAY, t / 60);
            c.set(Calendar.MINUTE, t % 60);
            return c.getTimeInMillis();
        }
        return -1;
    }

    private static int minutesOf(String hhmm) {
        try {
            int idx = hhmm.indexOf(':');
            if (idx <= 0) return -1;
            return Integer.parseInt(hhmm.substring(0, idx)) * 60 + Integer.parseInt(hhmm.substring(idx + 1));
        } catch (Exception e) {
            return -1;
        }
    }

    /** يزيح "HH:MM" بعدد من الدقائق. */
    static String shiftHM(String hhmm, int deltaMinutes) {
        try {
            int h = Integer.parseInt(hhmm.substring(0, hhmm.indexOf(':')));
            int m = Integer.parseInt(hhmm.substring(hhmm.indexOf(':') + 1));
            int total = ((h * 60 + m + deltaMinutes) % 1440 + 1440) % 1440;
            return String.format(Locale.US, "%02d:%02d", total / 60, total % 60);
        } catch (Exception e) {
            return hhmm;
        }
    }

    /** تاريخ (سنة، شهر، يوم) حسب ساعة المنطقة الزمنية. */
    static int[] wallDate(long millis, TimeZone tz) {
        Calendar c = Calendar.getInstance(tz);
        c.setTimeInMillis(millis);
        return new int[] { c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH) };
    }

    /** فهرس متنوع لاختيار نص الإشعار (يتغيّر كل يوم). */
    private static int dayIndex(long now) {
        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(now);
        return c.get(Calendar.DAY_OF_YEAR);
    }

    private static String pick(JSONArray pool, int index) {
        if (pool == null || pool.length() == 0) return "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ";
        int i = Math.abs(index) % pool.length();
        String s = pool.optString(i, "");
        if (s == null || s.trim().isEmpty()) s = pool.optString(0, "");
        return s == null || s.trim().isEmpty() ? "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ" : s;
    }

    /* ════════════════ القنوات ════════════════ */

    static void ensureChannels(Context ctx) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;

        if (nm.getNotificationChannel(CH_ADHKAR) == null) {
            NotificationChannel ch = new NotificationChannel(CH_ADHKAR, "أذكار المسلم", NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription("تذكير بأذكار الصباح والمساء والذكر الدوري");
            ch.enableVibration(true);
            nm.createNotificationChannel(ch);
        }
        if (nm.getNotificationChannel(CH_PRAYER) == null) {
            NotificationChannel ch = new NotificationChannel(CH_PRAYER, "مواقيت الصلاة", NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription("تذكير باقتراب مواقيت الصلاة");
            ch.enableVibration(true);
            nm.createNotificationChannel(ch);
        }
        if (nm.getNotificationChannel(CH_ADHAN) == null) {
            NotificationChannel ch = new NotificationChannel(CH_ADHAN, "الأذان", NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription("صوت الأذان عند دخول وقت الصلاة");
            // نفس صيغة المورد التي يستخدمها Capacitor ⇒ نفس الصوت
            Uri sound = Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + ctx.getPackageName()
                    + "/raw/adhan");
            ch.setSound(sound, new android.media.AudioAttributes.Builder()
                    .setContentType(android.media.AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(android.media.AudioAttributes.USAGE_NOTIFICATION)
                    .build());
            ch.enableVibration(true);
            nm.createNotificationChannel(ch);
        }
    }

    /** يبني إشعاراً جاهزاً للنشر. */
    static Notification buildNotification(Context ctx, String channelId, String title, String body) {
        Intent open = new Intent(ctx, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(ctx, 0, open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        NotificationCompat.Builder b = new NotificationCompat.Builder(ctx, channelId)
                .setSmallIcon(R.mipmap.ic_launcher_foreground)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_REMINDER)
                .setAutoCancel(true)
                .setContentIntent(pi)
                .setWhen(System.currentTimeMillis())
                .setShowWhen(true);
        return b.build();
    }

    /** ينشر الإشعار في شريط الإشعارات. */
    static void notify(Context ctx, String channelId, String title, String body, int id) {
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        try {
            nm.notify(id, buildNotification(ctx, channelId, title, body));
        } catch (Exception ignored) {
        }
    }

    /** معرّف ثابت لكل نوع إشعار (حتى يستبدل نفسه بدل التكدّس). */
    static int notificationId(String kind) {
        int h = kind == null ? 0 : kind.hashCode();
        return 90000 + (h & 0x3fff);
    }

    /** يقرأ إعداداً من قسم الإعدادات. */
    static SharedPreferences prefs(Context ctx) {
        return ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }
}
