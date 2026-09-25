package com.muslim.adhkar.wird;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * يساعد في منح التطبيق الإعفاء من "تحسين استهلاك البطارية" حتى لا تمنع
 * أندرويد/هواتف Xiaomi وHuawei وغيرها وصول إشعارات التذكير المجدولة
 * بعد إغلاق التطبيق تماماً.
 */
@CapacitorPlugin(name = "BatteryOptimizer")
public class BatteryOptimizerPlugin extends Plugin {

    @PluginMethod
    public void isIgnoringOptimizations(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("isExempt", isIgnoring());
        call.resolve(ret);
    }

    @PluginMethod
    public void requestExemption(PluginCall call) {
        if (isIgnoring()) {
            JSObject ret = new JSObject();
            ret.put("granted", true);
            call.resolve(ret);
            return;
        }
        try {
            Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        } catch (Exception e) {
            try {
                Intent intent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
            } catch (Exception e2) {
                call.reject("cannot open settings", e2);
                return;
            }
        }
        JSObject ret = new JSObject();
        ret.put("granted", isIgnoring());
        call.resolve(ret);
    }

    private boolean isIgnoring() {
        Context ctx = getContext();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PowerManager pm = (PowerManager) ctx.getSystemService(Context.POWER_SERVICE);
            return pm != null && pm.isIgnoringBatteryOptimizations(ctx.getPackageName());
        }
        return true;
    }
}