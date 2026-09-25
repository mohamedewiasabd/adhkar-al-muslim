package com.muslim.adhkar.wird;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * نابض ودجد الصلاة القادمة: يُعيد رسم العدّاد ويُواصل العملاقة كل دقيقة.
 */
public class PrayerWidgetAlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        PrayerWidgetUpdater.renderAll(context);
    }
}