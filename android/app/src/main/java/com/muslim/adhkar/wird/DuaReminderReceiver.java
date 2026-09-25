package com.muslim.adhkar.wird;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Random;

/**
 * يستقبل انطلاق المؤقّت من DuaScheduler، ويختار دعاءً عشوائياً من المخزون،
 * ثم يعرضه في الشاشة الكاملة ويعيد جدولة الموعد التالي للحدث نفسه.
 */
public class DuaReminderReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        Context ctx = context.getApplicationContext();
        String type = intent.getStringExtra("type");
        if (type == null) return;

        SharedPreferences sp = ctx.getSharedPreferences(DuaReminderPlugin.PREFS_NAME, Context.MODE_PRIVATE);
        String cfgStr = sp.getString(DuaReminderPlugin.KEY_CONFIG, "");
        if (cfgStr.isEmpty()) return;

        final JSONObject cfg;
        try {
            cfg = new JSONObject(cfgStr);
        } catch (JSONException e) {
            return;
        }
        if (!cfg.optBoolean("enabled", false)) return;

        // 1) اختر نصاً عشوائياً حسب النوع
        String title = cfg.optString(
                DuaReminderPlugin.TYPE_MORNING.equals(type) ? "morningTitle" : "periodicTitle",
                "تذكير بذكر الله");
        if (DuaReminderPlugin.TYPE_MORNING.equals(type)) {
            title = cfg.optString("morningTitle", title);
        } else if (DuaReminderPlugin.TYPE_EVENING.equals(type)) {
            title = cfg.optString("eveningTitle", title);
        } else {
            title = cfg.optString("periodicTitle", title);
        }

        JSONObject item = pick(ctx, cfg, keyFor(type));
        if (item == null) return;

        final String text = item.optString("t", item.optString("text", "﴿ سُبْحَانَ اللَّهِ ﴾"));
        final String benefit = item.optString("b", item.optString("benefit", ""));
        final String reference = item.optString("r", item.optString("reference", ""));
        final boolean sound = cfg.optBoolean("soundEnabled", true);
        final boolean vibrate = cfg.optBoolean("vibrateEnabled", true);

        // 2) اعرضه في الشاشة الكاملة (حتى لو كان التطبيق مغلقاً)
        DuaReminderOverlayLauncher.ring(ctx, sound, vibrate);
        DuaReminderOverlayLauncher.showViaNotification(ctx, title, text, benefit, reference, sound, vibrate);

        // 3) إعادة جدولة الموعد التالي لنفس النوع (تتابع ذاتي)
        rescheduleNext(ctx, cfg, type);
    }

    private static String keyFor(String type) {
        if (DuaReminderPlugin.TYPE_MORNING.equals(type)) return "morning";
        if (DuaReminderPlugin.TYPE_EVENING.equals(type)) return "evening";
        return "periodic";
    }

    private static JSONObject pick(Context ctx, JSONObject cfg, String key) {
        JSONArray arr = cfg.optJSONArray(key);
        if (arr == null || arr.length() == 0) return null;
        int idx = new Random(System.currentTimeMillis()).nextInt(arr.length());
        try {
            JSONObject item = arr.optJSONObject(idx);
            if (item != null) return item;
            // لو كانت مصفوفة نصوص مباشرة
            String plain = arr.optString(idx, null);
            if (plain != null) {
                JSONObject o = new JSONObject();
                o.put("t", plain);
                return o;
            }
        } catch (JSONException ignored) {
        }
        return null;
    }

    private static void rescheduleNext(Context ctx, JSONObject cfg, String type) {
        String morningTime = cfg.optString("morningTime", "06:45");
        String eveningTime = cfg.optString("eveningTime", "18:00");
        int interval = Math.min(240, Math.max(5, cfg.optInt("intervalMinutes", 60)));

        if (DuaReminderPlugin.TYPE_MORNING.equals(type)) {
            long next = DuaScheduler.nextTimeOfDay(morningTime, System.currentTimeMillis() + 60_000);
            if (next > 0) {
                DuaScheduler.scheduleOne(ctx, DuaReminderPlugin.CODE_MORNING, DuaReminderPlugin.TYPE_MORNING, next);
            }
        } else if (DuaReminderPlugin.TYPE_EVENING.equals(type)) {
            long next = DuaScheduler.nextTimeOfDay(eveningTime, System.currentTimeMillis() + 60_000);
            if (next > 0) {
                DuaScheduler.scheduleOne(ctx, DuaReminderPlugin.CODE_EVENING, DuaReminderPlugin.TYPE_EVENING, next);
            }
        } else {
            long next = DuaScheduler.nextPeriodic(
                    System.currentTimeMillis() + 60_000,
                    interval, morningTime, eveningTime);
            if (next > 0) {
                DuaScheduler.scheduleOne(ctx, DuaReminderPlugin.CODE_PERIODIC, DuaReminderPlugin.TYPE_PERIODIC, next);
            }
        }
    }
}