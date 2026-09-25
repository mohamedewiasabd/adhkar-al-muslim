package com.muslim.adhkar.wird;

import android.app.AlarmManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * يعرّف/يطلب إذن «التنبيهات الدقيقة» (SCHEDULE_EXACT_ALARM) على
 * Android 12+، وهو ضروري لكي تُطلق إشعارات الأذان في لَحظتها بالضبط
 * حتى مع إغلاق التطبيق. بدون هذا الإذن تتجاهل أندرويد الجدولة الصامتة.
 */
@CapacitorPlugin(name = "ExactAlarm")
public class ExactAlarmPlugin extends Plugin {

    @PluginMethod
    public void canScheduleExactAlarms(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", supportsExactAlarms() && isGranted());
        call.resolve(ret);
    }

    @PluginMethod
    public void requestExactAlarmPermission(PluginCall call) {
        JSObject ret = new JSObject();
        if (!supportsExactAlarms() || isGranted()) {
            ret.put("granted", true);
            ret.put("supported", true);
            call.resolve(ret);
            return;
        }
        try {
            Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            ret.put("granted", false);
        } catch (Exception e) {
            ret.put("granted", false);
            ret.put("error", e.getMessage());
        }
        ret.put("supported", supportsExactAlarms());
        call.resolve(ret);
    }

    private boolean supportsExactAlarms() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.S;
    }

    private boolean isGranted() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return true;
        AlarmManager am = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
        return am != null && am.canScheduleExactAlarms();
    }
}