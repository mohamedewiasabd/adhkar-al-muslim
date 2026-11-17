package com.muslim.adhkar.wird;

import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;

/**
 * يراقب تغيير وضع الهاتف (عدم الإزعاج) أثناء النافذة المحددة.
 *
 * يُسجَّل ديناميكياً فقط أثناء النافذة — لأن بث
 * ACTION_INTERRUPTION_FILTER_CHANGED لا يصل دائماً لمستقبِل مُسجَّل فيManifest.
 */
final class DndWatchdog extends BroadcastReceiver {

    private static DndWatchdog instance = null;

    private DndWatchdog() {
    }

    static synchronized void register(Context ctx) {
        if (instance != null) return;
        try {
            IntentFilter filter = new IntentFilter(NotificationManager.ACTION_INTERRUPTION_FILTER_CHANGED);
            DndWatchdog w = new DndWatchdog();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                ctx.registerReceiver(w, filter, Context.RECEIVER_NOT_EXPORTED);
            } else {
                ctx.registerReceiver(w, filter);
            }
            instance = w;
        } catch (Exception ignored) {
        }
    }

    static synchronized void unregister(Context ctx) {
        if (instance == null) return;
        try {
            ctx.unregisterReceiver(instance);
        } catch (Exception ignored) {
        }
        instance = null;
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !NotificationManager.ACTION_INTERRUPTION_FILTER_CHANGED.equals(intent.getAction())) {
            return;
        }
        DndController.onFilterChanged(context.getApplicationContext());
    }
}
