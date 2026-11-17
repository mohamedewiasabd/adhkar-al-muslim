package com.muslim.adhkar.wird;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * يستعيد الجدولة الدائمة بعد إقلاع الجهاز أو تغيّر الوقت/المنطقة الزمنية/التاريخ.
 *
 * بدون هذا المستقبِل، تفقد كل المؤقّتات عند إعادة تشغيل الهاتف — وهذا سبب
 * رئيسي لكون الإشعارات "تتوقف تلقائياً كل يوم" عند بعض الأجهزة.
 */
public class SchedulerBootReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent == null ? null : intent.getAction();
        if (action == null) return;
        if (Intent.ACTION_BOOT_COMPLETED.equals(action)
                || Intent.ACTION_TIME_CHANGED.equals(action)
                || Intent.ACTION_TIMEZONE_CHANGED.equals(action)
                || Intent.ACTION_DATE_CHANGED.equals(action)
                || Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)
                || "android.intent.action.QUICKBOOT_POWERON".equals(action)) {
            NativeScheduler.rescheduleAll(context.getApplicationContext());
            DndController.restoreOnBoot(context.getApplicationContext());
        }
    }
}
