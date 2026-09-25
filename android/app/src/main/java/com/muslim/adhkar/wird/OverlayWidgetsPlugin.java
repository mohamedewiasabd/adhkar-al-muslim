package com.muslim.adhkar.wird;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * جسر الودجات العائمة:
 *  - hasOverlayPermission / requestOverlayPermission (بالطبع SYYSTEM_ALERT_WINDOW)
 *  - addWidget / updateWidget / removeWidget / setVisible / listWidgets
 * تُخزَّن المواصفات والمواضع والعدادات محلياً فتعمل الودجات خارج التطبيق وعلى شاشة القفل.
 */
@CapacitorPlugin(name = "OverlayWidgets")
public class OverlayWidgetsPlugin extends Plugin {

    @PluginMethod
    public void hasOverlayPermission(PluginCall call) {
        boolean granted = Build.VERSION.SDK_INT < Build.VERSION_CODES.M
                || Settings.canDrawOverlays(getContext());
        JSObject ret = new JSObject();
        ret.put("granted", granted);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestOverlayPermission(PluginCall call) {
        boolean opened = false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(getContext())) {
            Context ctx = getContext();
            try {
                Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:" + ctx.getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                ctx.startActivity(intent);
                opened = true;
            } catch (Exception e) {
                // بعض الأجهزة لا تدعم معرّف الحزمة داخل ACTION — نفتح قائمة الرسم الكاملة
                try {
                    Intent fallback = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION);
                    fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    ctx.startActivity(fallback);
                    opened = true;
                } catch (Exception e2) {
                    opened = false;
                }
            }
        } else {
            opened = true;
        }
        JSObject ret = new JSObject();
        ret.put("opened", opened);
        call.resolve(ret);
    }

    @PluginMethod
    public void addWidget(PluginCall call) {
        try {
            JSONObject spec = call.getObject("spec");
            String id = spec.optString("id", "");
            if (id.isEmpty()) {
                id = "w-" + System.currentTimeMillis();
                spec.put("id", id);
            }
            spec.put("visible", true);
            if (!spec.has("x")) spec.put("x", 50);
            if (!spec.has("y")) spec.put("y", 300);
            JSONArray arr = WidgetsPrefs.load(getContext());
            JSONArray next = new JSONArray();
            for (int i = 0; i < arr.length(); i++) {
                JSONObject o = arr.optJSONObject(i);
                if (o != null && !id.equals(o.optString("id"))) next.put(o);
            }
            next.put(spec);
            WidgetsPrefs.save(getContext(), next);
            FloatingWidgetsService.refresh(getContext());
            call.resolve(listJson());
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void updateWidget(PluginCall call) {
        try {
            String id = call.getString("id");
            JSONObject patch = call.getObject("spec");
            JSONArray arr = WidgetsPrefs.load(getContext());
            JSONObject target = null;
            for (int i = 0; i < arr.length(); i++) {
                JSONObject o = arr.optJSONObject(i);
                if (o != null && id.equals(o.optString("id"))) {
                    target = o;
                    break;
                }
            }
            if (target == null) {
                call.reject("Widget not found");
                return;
            }
            if (patch.has("items")) {
                JSONArray oldItems = target.optJSONArray("items");
                JSONArray newItems = patch.getJSONArray("items");
                if (oldItems != null) {
                    for (int i = 0; i < newItems.length(); i++) {
                        JSONObject ni = newItems.optJSONObject(i);
                        if (ni == null) continue;
                        String nid = ni.optString("id", "");
                        if (nid.isEmpty()) continue;
                        for (int j = 0; j < oldItems.length(); j++) {
                            JSONObject oi = oldItems.optJSONObject(j);
                            if (oi != null && nid.equals(oi.optString("id"))) {
                                ni.put("count", oi.optInt("count", ni.optInt("count", 0)));
                                ni.put("done", oi.optBoolean("done", ni.optBoolean("done", false)));
                            }
                        }
                    }
                }
                target.put("items", newItems);
            }
            if (patch.has("title")) target.put("title", patch.optString("title"));
            if (patch.has("size")) target.put("size", patch.optString("size"));
            if (patch.has("target")) target.put("target", patch.optInt("target"));
            if (patch.has("index")) target.put("index", patch.optInt("index"));
            WidgetsPrefs.save(getContext(), arr);
            FloatingWidgetsService.refresh(getContext());
            call.resolve(listJson());
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void removeWidget(PluginCall call) {
        try {
            String id = call.getString("id");
            JSONArray arr = WidgetsPrefs.load(getContext());
            JSONArray next = new JSONArray();
            for (int i = 0; i < arr.length(); i++) {
                JSONObject o = arr.optJSONObject(i);
                if (o != null && !id.equals(o.optString("id"))) next.put(o);
            }
            WidgetsPrefs.save(getContext(), next);
            FloatingWidgetsService.refresh(getContext());
            call.resolve(listJson());
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void setVisible(PluginCall call) {
        try {
            String id = call.getString("id");
            boolean visible = call.getBoolean("visible", true);
            JSONArray arr = WidgetsPrefs.load(getContext());
            for (int i = 0; i < arr.length(); i++) {
                JSONObject o = arr.optJSONObject(i);
                if (o != null && id.equals(o.optString("id"))) o.put("visible", visible);
            }
            WidgetsPrefs.save(getContext(), arr);
            FloatingWidgetsService.refresh(getContext());
            call.resolve(listJson());
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void restartService(PluginCall call) {
        Context ctx = getContext();
        try {
            Intent i = new Intent(ctx, FloatingWidgetsService.class);
            ctx.stopService(i);
        } catch (Exception ignored) {
        }
        FloatingWidgetsService.refresh(ctx);
        call.resolve();
    }

    @PluginMethod
    public void listWidgets(PluginCall call) {
        call.resolve(listJson());
    }

    private JSObject listJson() {
        JSObject ret = new JSObject();
        JSArray js = new JSArray();
        JSONArray arr = WidgetsPrefs.load(getContext());
        for (int i = 0; i < arr.length(); i++) {
            js.put(arr.opt(i));
        }
        ret.put("widgets", js);
        return ret;
    }
}