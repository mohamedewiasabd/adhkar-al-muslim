package com.muslim.adhkar.wird;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;

/** جسر Capacitor للتحكم في وضع "عدم الإزعاج" بعد الأذان. */
@CapacitorPlugin(name = "DndController")
public class DndPlugin extends Plugin {

    @PluginMethod
    public void status(PluginCall call) {
        try {
            JSObject ret = JSObject.fromJSONObject(DndController.status(getContext().getApplicationContext()));
            call.resolve(ret);
        } catch (JSONException e) {
            call.reject("failed to read DND status", e);
        }
    }

    /** يُفعّل/يُوقف الميزة. */
    @PluginMethod
    public void setEnabled(PluginCall call) {
        boolean enabled = call.getBoolean("enabled", false);
        DndController.configure(getContext().getApplicationContext(), enabled);
        try {
            JSObject ret = JSObject.fromJSONObject(DndController.status(getContext().getApplicationContext()));
            call.resolve(ret);
        } catch (JSONException e) {
            call.reject("failed to apply DND setting", e);
        }
    }

    /** هل لدينا صلاحية النظام؟ */
    @PluginMethod
    public void canControl(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", DndController.canControl(getContext().getApplicationContext()));
        call.resolve(ret);
    }

    /** يفتح شاشة النظام لمنح الصلاحية. */
    @PluginMethod
    public void openSettings(PluginCall call) {
        DndController.openPermissionSettings(getContext().getApplicationContext());
        call.resolve();
    }
}
