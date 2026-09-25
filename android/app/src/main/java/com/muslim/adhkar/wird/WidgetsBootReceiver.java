package com.muslim.adhkar.wird;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** يعيد تشغيل الودجات العائمة بعد إقلاع الجهاز. */
public class WidgetsBootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            FloatingWidgetsService.refresh(context);
        }
    }
}