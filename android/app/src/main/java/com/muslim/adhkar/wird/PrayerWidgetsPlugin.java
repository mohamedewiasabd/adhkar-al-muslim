package com.muslim.adhkar.wird;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONObject;

/**
 * جسر Capacitor: الواجهة تعطينا مواقيت اليوم بالدقائق (HH:MM محلية الجهاز)
 * فنتخزنها في التفضيلات ونرسم ودجد الصلاة القادمة وندير عملاقة الدقيقة.
 */
@CapacitorPlugin(name = "PrayerWidgets")
public class PrayerWidgetsPlugin extends Plugin {

    @PluginMethod
    public void setTimes(PluginCall call) {
        try {
            String date = call.getString("date");
            JSONObject times = call.getObject("times");
            if (times != null) {
                PrayerWidgetUpdater.storeTimes(getContext(), date, times);
                PrayerWidgetUpdater.renderAll(getContext());
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("failed to store prayer times", e);
        }
    }

    @PluginMethod
    public void forceUpdate(PluginCall call) {
        PrayerWidgetUpdater.renderAll(getContext());
        call.resolve();
    }
}