package com.muslim.adhkar.wird;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** مؤقّتات وضع عدم الإزعاج: بداية النافذة، نهايتها، وإعادة الوضع بعد تغيير المستخدم. */
public class DndReceiver extends BroadcastReceiver {

    static final String ACT_ON = "com.muslim.adhkar.wird.DND_ON";
    static final String ACT_OFF = "com.muslim.adhkar.wird.DND_OFF";
    static final String ACT_REAPPLY = "com.muslim.adhkar.wird.DND_REAPPLY";

    static final int RC_ON = 7101;
    static final int RC_OFF = 7102;
    static final int RC_REAPPLY = 7103;

    static final String[] PRAYERS = { "fajr", "dhuhr", "asr", "maghrib", "isha" };

    /** معرّف مؤقّت مستقل لبداية عدم إزعاج كل صلاة. */
    static int requestCodeFor(String prayer) {
        int index = 0;
        for (int i = 0; i < PRAYERS.length; i++) {
            if (PRAYERS[i].equals(prayer)) {
                index = i;
                break;
            }
        }
        return RC_ON + index;
    }

    private static final String EXTRA_PRAYER = "prayer";
    private static final String EXTRA_END = "end";

    @Override
    public void onReceive(Context context, Intent intent) {
        Context ctx = context.getApplicationContext();
        String action = intent == null ? null : intent.getAction();
        if (action == null) return;

        if (ACT_ON.equals(action)) {
            DndController.startWindow(ctx, intent.getStringExtra(EXTRA_PRAYER),
                    intent.getLongExtra(EXTRA_END, 0L));
        } else if (ACT_OFF.equals(action)) {
            DndController.endWindow(ctx);
        } else if (ACT_REAPPLY.equals(action)) {
            DndController.reapplyIfNeeded(ctx);
        }
    }

    static void schedule(Context ctx, int requestCode, long at, String action, String prayer, long end) {
        AlarmHelper.schedule(ctx, requestCode, at, action, prayer, end);
    }

    static void cancel(Context ctx, int requestCode) {
        AlarmHelper.cancel(ctx, requestCode);
    }
}
