package com.muslim.adhkar.wird;

import android.content.Context;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * جسر Capacitor بين الواجهة والمجدول الأصلي.
 *
 * الواجهة ترسل الإعدادات مرة واحدة (عند التشغيل أو عند تغييرها)، بعدها يتولّى
 * المجدول الأصلي كل شيء: حساب المواقيت، جدولة الإشعارات، وتحديث الودجات —
 * بلا حاجة لفتح التطبيق يومياً.
 */
@CapacitorPlugin(name = "NativeScheduler")
public class NativeSchedulerPlugin extends Plugin {

    /**
     * يستقبل إعدادات التذكير ومواقيت الصلاة (كنص JSON) ويبني الجدولة.
     *
     * adhkar = {
     *   enabled, morningTime, eveningTime, intervalMinutes,
     *   qiyamEnabled, qiyamTime, soundEnabled, vibrateEnabled,
     *   morningPool: [...], eveningPool: [...], periodicPool: [...]
     * }
     * prayer = {
     *   enabled, lat, lng, method, asr, highLats, fajrAngle, ishaAngle, tz,
     *   adhanEnabled, adhanPerPrayer: {...}, reminderEnabled, reminderLead,
     *   owabinReminder, tahajjudReminder
     * }
     */
    @PluginMethod
    public void configure(PluginCall call) {
        try {
            Context app = getContext().getApplicationContext();
            JSONObject adhkar = parse(call.getString("adhkar"));
            JSONObject prayer = parse(call.getString("prayer"));
            NativeScheduler.configure(app, adhkar, prayer);
            JSObject ret = new JSObject();
            ret.put("configured", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("failed to configure native scheduler", e);
        }
    }

    /** إعادة بناء الجدولة فوراً (مثلاً بعد تغيير إعدادات). */
    @PluginMethod
    public void sync(PluginCall call) {
        try {
            NativeScheduler.rescheduleAll(getContext().getApplicationContext());
            call.resolve();
        } catch (Exception e) {
            call.reject("failed to sync native scheduler", e);
        }
    }

    /** حالة الجدولة الحالية (للفحص والتشخيص). */
    @PluginMethod
    public void status(PluginCall call) {
        try {
            JSONObject cfg = NativeScheduler.loadConfig(getContext().getApplicationContext());
            JSObject ret = new JSObject();
            ret.put("configured", cfg.length() > 0);
            ret.put("adhkar", cfg.optJSONObject("adhkar"));
            ret.put("prayer", cfg.optJSONObject("prayer"));
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("failed to read native scheduler status", e);
        }
    }

    private JSONObject parse(String json) {
        if (json == null || json.trim().isEmpty()) return null;
        try {
            return new JSONObject(json);
        } catch (JSONException e) {
            return null;
        }
    }
}
