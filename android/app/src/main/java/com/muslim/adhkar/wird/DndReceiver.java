package com.muslim.adhkar.wird;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** مؤقّتات وضع عدم الإزعاج: بداية النافذة، نهايتها، وإعادة الوضع بعد تغيير المستخدم. */
public class DndReceiver extends BroadcastReceiver {

    static final String ACT_ON = "com.muslim.adhkar.wird.DND_ON";
    static final String ACT_OFF = "com.muslim.adhkar.wird.DND_OFF";
    static final String ACT_REAPPLY = "com.muslim.adhkar.wird.DND_REAPPLY";

    // نطاقات منفصلة تماماً — لا تتداخل مع بعضها (الخطأ السابق كان RC_ON + index يصطدم بـ RC_OFF)
    static final int RC_ON_BASE = 7200;      // 7200..7204 بداية كل صلاة (ساعة منبّه دقيقة)
    static final int RC_OFF = 7300;          // نهاية النافذة
    static final int RC_REAPPLY = 7400;      // إعادة الوضع بعد تغيير المستخدم
    static final int RC_ON_BACKUP_BASE = 7500; // 7500..7504 نسخة احتياطية دقيقة

    static final String[] PRAYERS = { "fajr", "dhuhr", "asr", "maghrib", "isha" };

    private static int indexOf(String prayer) {
        for (int i = 0; i < PRAYERS.length; i++) {
            if (PRAYERS[i].equals(prayer)) return i;
        }
        return 0;
    }

    /** معرّف مؤقّت مستقل لبداية عدم إزعاج كل صلاة. */
    static int requestCodeFor(String prayer) {
        return RC_ON_BASE + indexOf(prayer);
    }

    /** نسخة احتياطية بمعرّف مختلف تماماً — إن ألغت إدارة البطارية عند مصنّع ما المؤقّت الأساسي. */
    static int backupRequestCodeFor(String prayer) {
        return RC_ON_BACKUP_BASE + indexOf(prayer);
    }

    static void cancelOnAlarms(Context ctx, String prayer) {
        cancel(ctx, requestCodeFor(prayer));
        cancel(ctx, backupRequestCodeFor(prayer));
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

    /** مؤقّت ساعة منبّه: دقيق ومُعفى من Doze ⇒ يبدأ الصمت في موعده بالضبط. */
    static void scheduleExact(Context ctx, int requestCode, long at, String action, String prayer, long end) {
        AlarmHelper.scheduleAlarmClock(ctx, requestCode, at, action, prayer, end);
    }

    static void cancel(Context ctx, int requestCode) {
        AlarmHelper.cancel(ctx, requestCode);
    }
}
