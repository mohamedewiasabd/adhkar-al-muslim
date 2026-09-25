package com.muslim.adhkar.wird;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.SystemClock;

/**
 * قلبُ نبضٍ خلفي لويدجات الشاشة الرئيسية:
 * يعيد رسم عداد المسبحة وودجد الصلاة القادمة كل عدّة دقائق، ثم يُجدول
 * الدفعة التالية، حتى لا تحتاج الودجات إلى فتح التطبيق لتحديث نفسها.
 */
public class WidgetsHeartbeatReceiver extends BroadcastReceiver {

    private static final String ACTION_TICK = "com.muslim.adhkar.wird.WIDGETS_HEARTBEAT_TICK";
    private static final long INTERVAL_MS = 30 * 60 * 1000L;

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !ACTION_TICK.equals(intent.getAction())) return;
        CounterWidgetStore.renderAll(context);
        PrayerWidgetUpdater.renderAll(context);
        schedule(context);
    }

    /** يُجدول النبضة التالية. يُستدعى عند رسم الودجات أو فتح التطبيق ليبقى التحديث مستمراً. */
    static void schedule(Context context) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        Intent intent = new Intent(context, WidgetsHeartbeatReceiver.class).setAction(ACTION_TICK);
        PendingIntent pi = PendingIntent.getBroadcast(context, 7, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        am.setWindow(AlarmManager.ELAPSED_REALTIME_WAKEUP,
                SystemClock.elapsedRealtime() + INTERVAL_MS,
                60_000L, pi);
    }
}