package com.muslim.adhkar.wird;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * يعيد بناء جدولة الدعاء بعد إقلاع الجهاز أو تغيّر الساعة/المنطقة الزمنية
 * حتى يستمر الدعاء بالظهور في منتصف الشاشة دون إعادة فتح التطبيق.
 */
public class DuaReminderBootReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        Context ctx = context.getApplicationContext();
        SharedPreferences sp = ctx.getSharedPreferences(DuaReminderPlugin.PREFS_NAME, Context.MODE_PRIVATE);
        String cfgStr = sp.getString(DuaReminderPlugin.KEY_CONFIG, "");
        if (cfgStr.isEmpty()) return;

        try {
            JSONObject cfg = new JSONObject(cfgStr);
            if (!cfg.optBoolean("enabled", false)) return;
            DuaScheduler.scheduleAll(ctx, cfg);
        } catch (JSONException ignored) {
        }
    }
}