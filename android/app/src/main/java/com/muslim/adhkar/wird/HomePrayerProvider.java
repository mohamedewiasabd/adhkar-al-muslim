package com.muslim.adhkar.wird;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;

/**
 * ودجد «الصلاة القادمة» على الشاشة الرئيسية.
 * يُرسم البيانات من التفضيلات التي تملؤها الواجهة (PrayerWidgetsPlugin)
 * ويُجدَّد كل دقيقة عبر PrayerWidgetAlarmReceiver.
 */
public class HomePrayerProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context ctx, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        PrayerWidgetUpdater.renderAll(ctx);
        PrayerWidgetUpdater.scheduleUpdates(ctx);
    }
}