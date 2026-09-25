package com.muslim.adhkar.wird;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import org.json.JSONObject;

import java.util.Calendar;

/**
 * جدولة مؤقّتات "الدعاء في منتصف الشاشة" مع تتابع ذاتي:
 * كل حدث حلّ يعيد جدولة الحدث التالي من نفس النوع.
 */
public final class DuaScheduler {

    private static final String ACTION_TRIGGER = "com.muslim.adhkar.wird.DUA_REMINDER_TRIGGER";
    private static final String WAKE_START = "06:45";
    private static final String WAKE_END = "21:15";

    private DuaScheduler() {
    }

    /** يلغي كل المؤقّتات المجدولة لهذا التطبيق. */
    public static void cancelAll(Context ctx) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        for (int code : new int[]{
                DuaReminderPlugin.CODE_MORNING,
                DuaReminderPlugin.CODE_EVENING,
                DuaReminderPlugin.CODE_PERIODIC,
                DuaReminderPlugin.CODE_TEST}) {
            PendingIntent pi = buildPendingIntent(ctx, code, null, PendingIntent.FLAG_NO_CREATE);
            if (pi != null) {
                am.cancel(pi);
                pi.cancel();
            }
        }
    }

    /** يعيد بناء الجدولة بالكامل لأنواع التذكير الثلاثة. */
    public static void scheduleAll(Context ctx, JSONObject cfg) {
        cancelAll(ctx);
        String morningTime = cfg.optString("morningTime", "06:45");
        String eveningTime = cfg.optString("eveningTime", "18:00");
        int interval = Math.min(240, Math.max(5, cfg.optInt("intervalMinutes", 60)));
        scheduleNext(ctx, morningTime, eveningTime, interval);
    }

    private static PendingIntent buildPendingIntent(Context ctx, int code, String type, int flags) {
        Intent intent = new Intent(ctx, DuaReminderReceiver.class);
        intent.setAction(ACTION_TRIGGER);
        if (type != null) intent.putExtra("type", type);
        return PendingIntent.getBroadcast(ctx, code, intent, flags | PendingIntent.FLAG_IMMUTABLE);
    }

    public static int minutesOf(String hhmm) {
        try {
            String[] parts = hhmm.split(":");
            return Integer.parseInt(parts[0].trim()) * 60 + Integer.parseInt(parts[1].trim());
        } catch (Exception e) {
            return 0;
        }
    }

    /** يجدول الموعد التالي لكل نوع (صباح / مساء / دوري). */
    public static void scheduleNext(Context ctx, String morningTime, String eveningTime, int intervalMinutes) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        long now = System.currentTimeMillis();

        long morningTs = nextTimeOfDay(morningTime, now);
        if (morningTs > 0) {
            setAlarm(am, ctx, DuaReminderPlugin.CODE_MORNING, DuaReminderPlugin.TYPE_MORNING, morningTs);
        }

        long eveningTs = nextTimeOfDay(eveningTime, now);
        if (eveningTs > 0) {
            setAlarm(am, ctx, DuaReminderPlugin.CODE_EVENING, DuaReminderPlugin.TYPE_EVENING, eveningTs);
        }

        long periodicTs = nextPeriodic(now, intervalMinutes, morningTime, eveningTime);
        if (periodicTs > 0) {
            setAlarm(am, ctx, DuaReminderPlugin.CODE_PERIODIC, DuaReminderPlugin.TYPE_PERIODIC, periodicTs);
        }
    }

    private static void setAlarm(AlarmManager am, Context ctx, int requestCode, String type, long triggerAt) {
        scheduleOne(ctx, requestCode, type, triggerAt);
    }

    /** يجدول موعداً واحداً بدقة عند توفر منحة المنبهات وإلا بمؤقّت غير دقيق. */
    public static void scheduleOne(Context ctx, int requestCode, String type, long triggerAt) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am == null || triggerAt <= System.currentTimeMillis()) return;
        PendingIntent pi = buildPendingIntent(ctx, requestCode, type, PendingIntent.FLAG_UPDATE_CURRENT);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (DuaReminderPlugin.canExact(ctx)) {
                try {
                    am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pi);
                    return;
                } catch (SecurityException ignored) {
                    // المنحة "المنبهات ومؤقّتات الحسابات" غير متاحة → مؤقّت غير دقيق
                }
            }
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pi);
        } else {
            am.set(AlarmManager.RTC_WAKEUP, triggerAt, pi);
        }
    }

    /** أقرب زمن (HH:MM) بعد now (إن مرّ فغداً). */
    public static long nextTimeOfDay(String hhmm, long now) {
        int minutes = minutesOf(hhmm);
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

    /** أقرب موعد دوري ضمن نافذة الاستيقاظ (يتخطّى تصادم مواعيد الصباح/المساء). */
    public static long nextPeriodic(long now, int intervalMinutes, String morningTime, String eveningTime) {
        if (intervalMinutes <= 0) return -1;
        int start = minutesOf(WAKE_START);
        int end = minutesOf(WAKE_END);
        int m = minutesOf(morningTime);
        int e = minutesOf(eveningTime);

        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(now);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        int todayNowMinutes = c.get(Calendar.HOUR_OF_DAY) * 60 + c.get(Calendar.MINUTE);

        for (int t = start; t <= end; t += intervalMinutes) {
            if (t == m || t == e) continue;
            if (t > todayNowMinutes) {
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
}