package com.muslim.adhkar.wird;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * مكوّن أصلي يعرض الدعاء "في منتصف الشاشة" حتى عندما يكون التطبيق
 * مغلقاً تماماً — تماماً مثل الإشعارات المجدولة عبر مؤقّتات أندرويد.
 *
 * يعمل عبر:
 *  1) تخزين إعدادات التذكير والدعاءات في SharedPreferences.
 *  2) جدولة مؤقّتات دقيقة (Exact Alarms) لأوقات: الصباح / المساء / دوري.
 *  3) عند حلول الموعد يُطلق الواجهة الكاملة DuaReminderActivity فوق كل شيء
 *     (عبر full-screen notification intent) وتعرض نص الدعاء ثم تغلق نفسها.
 *  4) مؤقّت دائم التتابع: كل حدث يعيد جدولة الحدث التالي من نفس النوع.
 */
@CapacitorPlugin(name = "DuaOverlay")
public class DuaReminderPlugin extends Plugin {

    public static final String PREFS_NAME = "dua_overlay";
    public static final String KEY_CONFIG = "config";

    // Request codes لكل نوع تذكير
    public static final int CODE_MORNING = 2001;
    public static final int CODE_EVENING = 2002;
    public static final int CODE_PERIODIC = 2003;
    public static final int CODE_TEST = 2009;

    public static final String TYPE_MORNING = "morning";
    public static final String TYPE_EVENING = "evening";
    public static final String TYPE_PERIODIC = "periodic";

    @PluginMethod
    public void configure(PluginCall call) {
        Context ctx = getContext().getApplicationContext();

        boolean enabled = call.getBoolean("enabled", false);
        String morningTime = call.getString("morningTime", "06:45");
        String eveningTime = call.getString("eveningTime", "18:00");
        int intervalMinutes = Math.min(240, Math.max(5, call.getInt("intervalMinutes", 60)));
        boolean soundEnabled = call.getBoolean("soundEnabled", true);
        boolean vibrateEnabled = call.getBoolean("vibrateEnabled", true);

        String morningTitle = call.getString("morningTitle", "أذكار الصباح ☀️");
        String eveningTitle = call.getString("eveningTitle", "أذكار المساء 🌙");
        String periodicTitle = call.getString("periodicTitle", "دعاء للطمأنينة 🌿");

        JSONArray morning = toJsonArray(call.getArray("morning"));
        JSONArray evening = toJsonArray(call.getArray("evening"));
        JSONArray periodic = toJsonArray(call.getArray("periodic"));

        JSONObject cfg = new JSONObject();
        try {
            cfg.put("enabled", enabled);
            cfg.put("morningTime", morningTime);
            cfg.put("eveningTime", eveningTime);
            cfg.put("intervalMinutes", intervalMinutes);
            cfg.put("soundEnabled", soundEnabled);
            cfg.put("vibrateEnabled", vibrateEnabled);
            cfg.put("morningTitle", morningTitle);
            cfg.put("eveningTitle", eveningTitle);
            cfg.put("periodicTitle", periodicTitle);
            cfg.put("morning", morning);
            cfg.put("evening", evening);
            cfg.put("periodic", periodic);
        } catch (JSONException e) {
            call.reject("invalig config", e);
            return;
        }

        // 1) احفظ الإعدادات
        SharedPreferences sp = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        sp.edit().putString(KEY_CONFIG, cfg.toString()).apply();

        // 2) أعد بناء الجدولة من الصفر
        DuaScheduler.cancelAll(ctx);
        if (enabled) {
            DuaScheduler.scheduleNext(ctx, morningTime, eveningTime, intervalMinutes);
        }

        JSObject ret = new JSObject();
        ret.put("configured", true);
        ret.put("enabled", enabled);
        ret.put("scheduled", enabled ? 3 : 0);
        call.resolve(ret);
    }

    /** يلغي كل مؤقّتات الشاشة الكاملة. */
    @PluginMethod
    public void cancel(PluginCall call) {
        Context ctx = getContext().getApplicationContext();
        DuaScheduler.cancelAll(ctx);
        ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit().putString(KEY_CONFIG, "").apply();
        JSObject ret = new JSObject();
        ret.put("cancelled", true);
        call.resolve(ret);
    }

    /** يعرض دعاءً عشوائياً فوراً للمعاينة. */
    @PluginMethod
    public void testNow(PluginCall call) {
        Context ctx = getContext().getApplicationContext();
        String text = call.getString("text", "اللهم اعصمنا بدينك وطاعتك وطاعة رسولك");
        String benefit = call.getString("benefit", "");
        String reference = call.getString("reference", "");
        String title = call.getString("title", "دعاء للطمأنينة 🌿");
        boolean sound = call.getBoolean("soundEnabled", true);
        boolean vibrate = call.getBoolean("vibrateEnabled", true);

        DuaReminderOverlayLauncher.showImmediate(ctx, title, text, benefit, reference, sound, vibrate);
        JSObject ret = new JSObject();
        ret.put("shown", true);
        call.resolve(ret);
    }

    /** يقرأ المسار الحالي للمحتوى ولمعاينة الحالة. */
    @PluginMethod
    public void getStatus(PluginCall call) {
        Context ctx = getContext().getApplicationContext();
        SharedPreferences sp = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String cfg = sp.getString(KEY_CONFIG, "");
        JSObject ret = new JSObject();
        ret.put("configured", !cfg.isEmpty());
        if (!cfg.isEmpty()) {
            try {
                JSONObject o = new JSONObject(cfg);
                ret.put("enabled", o.optBoolean("enabled", false));
                ret.put("soundEnabled", o.optBoolean("soundEnabled", true));
                ret.put("vibrateEnabled", o.optBoolean("vibrateEnabled", true));
                ret.put("morningTime", o.optString("morningTime"));
                ret.put("eveningTime", o.optString("eveningTime"));
                ret.put("intervalMinutes", o.optInt("intervalMinutes", 60));
            } catch (JSONException ignored) {
            }
        }
        ret.put("exactAlarms", canExact(ctx));
        call.resolve(ret);
    }

    private static JSONArray toJsonArray(JSArray arr) {
        JSONArray out = new JSONArray();
        if (arr == null) return out;
        try {
            for (int i = 0; i < arr.length(); i++) {
                Object item = ((JSArray) arr).get(i);
                out.put(item);
            }
        } catch (JSONException e) {
            // ignore single bad items
        }
        return out;
    }

    /** هل المؤقّتات الدقيقة مسموحة (منحة "المنبهات والحسابات" في النظام)؟ */
    public static boolean canExact(Context ctx) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
            return am != null && am.canScheduleExactAlarms();
        }
        return true;
    }
}