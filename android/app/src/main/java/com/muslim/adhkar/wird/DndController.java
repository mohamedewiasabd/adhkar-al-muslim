package com.muslim.adhkar.wird;

import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.provider.Settings;

import org.json.JSONObject;

/**
 * وضع "عدم الإزعاج" بعد الأذان.
 *
 * السلوك:
 *  - بعد انتهاء الأذان بـ ~3 دقائق ⇒ الهاتف في وضع عدم الإزعاج.
 *  - المدة: ساعة كاملة لكل الصلوات، إلا المغرب ⇒ نصف ساعة.
 *  - لو غيّر أحد الوضع أثناء المدة ⇒ بعد دقيقة واحدة نعيد وضع عدم الإزعاج
 *    حتى تنتهي المدة (نراقب التغيير عبر ACTION_INTERRUPTION_FILTER_CHANGED).
 *  - عند انتهاء المدة نُعيد الوضع الأصلي الذي كان عليه الهاتف قبل الأذان.
 */
final class DndController {

    private static final String PREFS = "adhkar_dnd_v1";
    private static final String ENABLED = "enabled";
    private static final String WINDOW_START = "window_start";
    private static final String WINDOW_END = "window_end";
    private static final String ORIGINAL_FILTER = "original_filter";
    private static final String SELF_CHANGE_UNTIL = "self_change_until";
    private static final String PRAYER = "prayer";
    private static final String REAPPLY_PENDING = "reapply_pending";

    /** مدة الأذان الصوتي (الملف adhan.mp3 ≈ 173 ثانية) + هامش صغير. */
    static final long ADHAN_DURATION_MS = 180_000L;
    /** مدة عدم الإزعاج بعد الأذان. */
    static final long DURATION_MS = 60 * 60 * 1000L;
    /** مدة عدم الإزعاج بعد المغرب. */
    static final long MAGHRIB_DURATION_MS = 30 * 60 * 1000L;
    /** تأخير إعادة الوضع بعد تغيير المستخدم. */
    static final long REAPPLY_DELAY_MS = 60 * 1000L;
    /** نافذة تجاهل تغييراتنا نحن. */
    private static final long SELF_CHANGE_GRACE_MS = 8_000L;

    private DndController() {
    }

    private static SharedPreferences sp(Context ctx) {
        return ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    /* ════════════════ وتير الإعدادات ════════════════ */

    static void configure(Context ctx, boolean enabled) {
        Context app = ctx.getApplicationContext();
        sp(app).edit().putBoolean(ENABLED, enabled).apply();
        if (enabled) {
            DndWatchdog.register(app);
            if (hasActiveWindow(app)) {
                // نافذة ما زالت مفتوحة ⇒ أعد التسلسل بعد الإقلاع/تغيير الإعداد
                long end = sp(app).getLong(WINDOW_END, 0L);
                if (System.currentTimeMillis() < end) {
                    scheduleEnd(app, end);
                    reapplyIfNeeded(app);
                } else {
                    endWindow(app);
                }
            }
        } else {
            // إيقاف الميزة أثناء نافذة نشطة ⇒ نُعيد الوضع الأصلي فوراً
            if (hasActiveWindow(app)) restoreOriginal(app);
            clearWindow(app);
            DndWatchdog.unregister(app);
            cancelAllAlarms(app);
        }
        NativeScheduler.rescheduleAll(app);
    }

    static boolean isEnabled(Context ctx) {
        return sp(ctx).getBoolean(ENABLED, false);
    }

    /* ════════════════ الصلاحية ════════════════ */

    static boolean canControl(Context ctx) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) return false;
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        return nm != null && nm.isNotificationPolicyAccessGranted();
    }

    /** يفتح شاشة النظام لمنح صلاحية التحكم في وضع عدم الإزعاج. */
    static void openPermissionSettings(Context ctx) {
        try {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            ctx.startActivity(intent);
        } catch (Exception ignored) {
        }
    }

    /* ════════════════ جدولة النافذة ════════════════ */

    /**
     * يُجدول بداية ونهاية فترة عدم الإزعاج لصلاة واحدة.
     *
     * @param adhanInstant لحظة أذان الصلاة
     * @param prayerName اسم الصلاة (يُستخدم لتحديد مدة المغرب)
     */
    static void scheduleForPrayer(Context ctx, String prayerName, long adhanInstant) {
        Context app = ctx.getApplicationContext();
        if (!isEnabled(app) || !canControl(app)) return;

        long onAt = adhanInstant + ADHAN_DURATION_MS;
        long duration = "maghrib".equals(prayerName) ? MAGHRIB_DURATION_MS : DURATION_MS;
        long offAt = onAt + duration;
        long now = System.currentTimeMillis();
        if (onAt <= now) return;

        // لا نستبدل نافذة نشطة بصلاة تالية قبل انتهائها
        if (hasActiveWindow(app) && sp(app).getLong(WINDOW_END, 0L) > onAt) return;

        // معرّف مستقل لكل صلاة حتى لا تُستبدل نوافذ الصلوات بعضها
        int onCode = DndReceiver.requestCodeFor(prayerName);
        DndReceiver.cancel(app, onCode);
        DndReceiver.schedule(app, onCode, onAt, DndReceiver.ACT_ON, prayerName, offAt);
    }

    /** يبدأ فترة عدم الإزعاج (يُستدعى من المؤقّت). */
    static void startWindow(Context ctx, String prayerName, long offAt) {
        Context app = ctx.getApplicationContext();
        if (!isEnabled(app) || !canControl(app)) return;

        SharedPreferences p = sp(app);
        long now = System.currentTimeMillis();
        if (offAt <= now) return;

        NotificationManager nm = (NotificationManager) app.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;

        // نحفظ الوضع الأصلي مرة واحدة فقط (قبل أول تغيير لنا)
        if (!hasActiveWindow(app)) {
            p.edit()
                    .putLong(WINDOW_START, now)
                    .putLong(WINDOW_END, offAt)
                    .putInt(ORIGINAL_FILTER, safeFilter(nm))
                    .putString(PRAYER, prayerName)
                    .apply();
        } else {
            p.edit().putLong(WINDOW_END, offAt).putString(PRAYER, prayerName).apply();
        }

        DndWatchdog.register(app);
        applyDnd(app, false);
        scheduleEnd(app, sp(app).getLong(WINDOW_END, 0L));
    }

    /** يُنهي الفترة ويُعيد الوضع الذي كان عليه الهاتف. */
    static void endWindow(Context ctx) {
        Context app = ctx.getApplicationContext();
        restoreOriginal(app);
        clearWindow(app);
        DndWatchdog.unregister(app);
        DndReceiver.cancel(app, DndReceiver.RC_ON);
        DndReceiver.cancel(app, DndReceiver.RC_OFF);
        DndReceiver.cancel(app, DndReceiver.RC_REAPPLY);
    }

    static void scheduleEnd(Context ctx, long offAt) {
        DndReceiver.cancel(ctx, DndReceiver.RC_OFF);
        if (offAt > System.currentTimeMillis()) {
            DndReceiver.schedule(ctx, DndReceiver.RC_OFF, offAt, DndReceiver.ACT_OFF, null, 0L);
        }
    }

    private static void clearWindow(Context ctx) {
        sp(ctx).edit()
                .remove(WINDOW_START).remove(WINDOW_END).remove(ORIGINAL_FILTER)
                .remove(PRAYER).remove(SELF_CHANGE_UNTIL).remove(REAPPLY_PENDING)
                .apply();
    }

    static boolean hasActiveWindow(Context ctx) {
        return sp(ctx).getLong(WINDOW_END, 0L) > 0L;
    }

    static long windowEnd(Context ctx) {
        return sp(ctx).getLong(WINDOW_END, 0L);
    }

    /* ════════════════ تطبيق / مراقبة الوضع ════════════════ */

    private static void applyDnd(Context ctx, boolean selfChange) {
        if (!canControl(ctx)) return;
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        try {
            if (selfChange) {
                sp(ctx).edit().putLong(SELF_CHANGE_UNTIL,
                        System.currentTimeMillis() + SELF_CHANGE_GRACE_MS).apply();
            }
            nm.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_NONE);
        } catch (Exception ignored) {
        }
    }

    private static void restoreOriginal(Context ctx) {
        if (!canControl(ctx)) return;
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        int original = sp(ctx).getInt(ORIGINAL_FILTER, NotificationManager.INTERRUPTION_FILTER_ALL);
        try {
            sp(ctx).edit().putLong(SELF_CHANGE_UNTIL,
                    System.currentTimeMillis() + SELF_CHANGE_GRACE_MS).apply();
            nm.setInterruptionFilter(original);
        } catch (Exception ignored) {
        }
    }

    /**
     * يستقبل إشارة تغيير وضع الهاتف. لو كان التغيير من المستخدم أثناء النافذة
     * ⇒ نُجدول إعادة الوضع بعد دقيقة واحدة.
     */
    static void onFilterChanged(Context ctx) {
        Context app = ctx.getApplicationContext();
        if (!isEnabled(app) || !hasActiveWindow(app)) return;

        SharedPreferences p = sp(app);
        long now = System.currentTimeMillis();
        long end = p.getLong(WINDOW_END, 0L);
        if (now >= end) {
            endWindow(app);
            return;
        }
        // تجاهل التغيير الذي أحدثناه نحن
        if (now < p.getLong(SELF_CHANGE_UNTIL, 0L)) return;

        NotificationManager nm = (NotificationManager) app.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null && nm.getCurrentInterruptionFilter() == NotificationManager.INTERRUPTION_FILTER_NONE) {
            // الوضع ما زال عدم إزعاج (تغيير بين مستوياته) ⇒ لا شيء
            return;
        }

        // مستخدم غيّر الوضع ⇒ أعد جدولة "الإعادة بعد دقيقة" من آخر تغيير
        DndReceiver.cancel(app, DndReceiver.RC_REAPPLY);
        DndReceiver.schedule(app, DndReceiver.RC_REAPPLY, now + REAPPLY_DELAY_MS,
                DndReceiver.ACT_REAPPLY, null, 0L);
        p.edit().putBoolean(REAPPLY_PENDING, true).apply();
    }

    /** إعادة الوضع بعد دقيقة من تغيير المستخدم (إن بقيت النافذة). */
    static void reapplyIfNeeded(Context ctx) {
        Context app = ctx.getApplicationContext();
        if (!isEnabled(app)) return;
        long now = System.currentTimeMillis();
        long end = sp(app).getLong(WINDOW_END, 0L);
        if (end <= 0L) return;
        if (now >= end) {
            endWindow(app);
            return;
        }
        DndWatchdog.register(app);
        applyDnd(app, true);
        sp(app).edit().putBoolean(REAPPLY_PENDING, false).apply();
        scheduleEnd(app, end);
    }

    /** يُستدعى بعد الإقلاع أو تثبيت تحديث لاستعادة الحالة. */
    static void restoreOnBoot(Context ctx) {
        Context app = ctx.getApplicationContext();
        if (!isEnabled(app)) return;
        long now = System.currentTimeMillis();
        long end = sp(app).getLong(WINDOW_END, 0L);
        if (end <= 0L) return;
        if (now >= end) {
            endWindow(app);
            return;
        }
        DndWatchdog.register(app);
        scheduleEnd(app, end);
        // أعد الوضع فقط إذا كان المستخدم قد غيّره أثناء غياب التطبيق
        NotificationManager nm = (NotificationManager) app.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null && nm.getCurrentInterruptionFilter() != NotificationManager.INTERRUPTION_FILTER_NONE) {
            reapplyIfNeeded(app);
        }
    }

    private static int safeFilter(NotificationManager nm) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
            return NotificationManager.INTERRUPTION_FILTER_ALL;
        }
        try {
            return nm.getCurrentInterruptionFilter();
        } catch (Exception e) {
            return NotificationManager.INTERRUPTION_FILTER_ALL;
        }
    }

    private static void cancelAllAlarms(Context ctx) {
        DndReceiver.cancel(ctx, DndReceiver.RC_OFF);
        DndReceiver.cancel(ctx, DndReceiver.RC_REAPPLY);
        for (String name : DndReceiver.PRAYERS) {
            DndReceiver.cancel(ctx, DndReceiver.requestCodeFor(name));
        }
    }

    /** حالة الميزة للواجهة. */
    static JSONObject status(Context ctx) {
        JSONObject out = new JSONObject();
        try {
            out.put("enabled", isEnabled(ctx));
            out.put("permission", canControl(ctx));
            out.put("windowEnd", windowEnd(ctx));
            out.put("active", hasActiveWindow(ctx) && System.currentTimeMillis() < windowEnd(ctx));
        } catch (Exception ignored) {
        }
        return out;
    }
}
