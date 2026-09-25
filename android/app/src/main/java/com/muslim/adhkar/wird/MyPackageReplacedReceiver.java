package com.muslim.adhkar.wird;

import android.appwidget.AppWidgetManager;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;

/**
 * يُعيد رسم كل الودجات فورياً بعد تحديث التطبيق (تثبيت إصدار جديد)
 * حتى لا تبقى الودجات على الشاشة الرئيسية بالشكل/البيانات القديمة.
 */
public class MyPackageReplacedReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (!Intent.ACTION_MY_PACKAGE_REPLACED.equals(intent.getAction())) return;

        CounterWidgetStore.renderAll(context);

        PrayerWidgetUpdater.renderAll(context);
        PrayerWidgetUpdater.scheduleUpdates(context);

        WidgetsHeartbeatReceiver.schedule(context);

        try {
            FloatingWidgetsService.refresh(context);
        } catch (Exception ignored) {
            // الخدمة العائمة لا تزال بحاجة للتطبيق مفتوحاً
        }
    }
}