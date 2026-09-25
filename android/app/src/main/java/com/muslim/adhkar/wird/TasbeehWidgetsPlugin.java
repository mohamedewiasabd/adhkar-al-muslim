package com.muslim.adhkar.wird;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * جسر Capacitor لودجد «المسبحة» على الشاشة الرئيسية:
 * الواجهة (JS) تدفع قائمة الأذكار المخصّصة {text, count} ونُخزّنها ونعيد رسم الودجد.
 */
@CapacitorPlugin(name = "TasbeehWidgets")
public class TasbeehWidgetsPlugin extends Plugin {

    @PluginMethod
    public void setItems(PluginCall call) {
        try {
            String itemsJson = call.getString("items");
            CounterWidgetStore.storeItems(getContext(), itemsJson);
            CounterWidgetStore.renderAll(getContext());
            call.resolve();
        } catch (Exception e) {
            call.reject("failed to store tasbeeh items", e);
        }
    }

    @PluginMethod
    public void forceRender(PluginCall call) {
        CounterWidgetStore.renderAll(getContext());
        call.resolve();
    }
}