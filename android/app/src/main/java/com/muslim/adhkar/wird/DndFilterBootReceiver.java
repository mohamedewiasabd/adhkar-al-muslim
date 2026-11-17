package com.muslim.adhkar.wird;

import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * مستقبِل ثابت لتغييرات وضع الهاتف (يعمل حتى لو قُتل التطبيق).
 * يعيد تسجيل المراقب الديناميكي ثم يتعامل مع التغيير.
 */
public class DndFilterBootReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;
        if (!NotificationManager.ACTION_INTERRUPTION_FILTER_CHANGED.equals(intent.getAction())) return;
        Context app = context.getApplicationContext();
        DndWatchdog.register(app);
        DndController.onFilterChanged(app);
    }
}
