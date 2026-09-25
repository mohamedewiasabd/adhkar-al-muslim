package com.muslim.adhkar.wird;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * جسر قسم «تطبيقاتنا»:
 *  - isAppInstalled: هل التطبيق مثبّت على الجهاز؟
 *  - open: يفتح التطبيق مباشرةً إن كان مثبّتاً، وإلا ينتقل لصفحته في جوجل بلاي للتثبيت.
 *  - openUrl: يفتح رابطاً خارجياً عبر متصفح النظام (بديل مضمون لأي فشل).
 */
@CapacitorPlugin(name = "OurApps")
public class OurAppsPlugin extends Plugin {

    @PluginMethod
    public void isAppInstalled(PluginCall call) {
        String packageName = call.getString("packageName", "");
        call.resolve(new JSObject().put("installed",
                !packageName.isEmpty() && installed(packageName)));
    }

    @PluginMethod
    public void open(PluginCall call) {
        String packageName = call.getString("packageName", "");
        if (packageName.isEmpty()) {
            call.reject("packageName is required");
            return;
        }
        Context ctx = getContext();
        if (installed(packageName)) {
            Intent launch = ctx.getPackageManager().getLaunchIntentForPackage(packageName);
            if (launch != null && openExternally(ctx, launch)) {
                call.resolve(new JSObject().put("kind", "app"));
                return;
            }
        }
        call.resolve(new JSObject().put("kind",
                openPlayStore(ctx, packageName) ? "store" : "none"));
    }

    @PluginMethod
    public void openUrl(PluginCall call) {
        String url = call.getString("url", "");
        if (url.isEmpty()) {
            call.reject("url is required");
            return;
        }
        call.resolve(new JSObject().put("opened",
                openExternally(ctx(), new Intent(Intent.ACTION_VIEW, Uri.parse(url)))));
    }

    private Context ctx() {
        return getContext();
    }

    /** يفتح نية خارجية (تطبيق/متصفح) بأمان، ويعيد true إذا نجح الفتح فعلاً. */
    private boolean openExternally(Context ctx, Intent intent) {
        try {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            ctx.startActivity(intent);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean openPlayStore(Context ctx, String packageName) {
        if (openExternally(ctx, new Intent(Intent.ACTION_VIEW,
                Uri.parse("https://play.google.com/store/apps/details?id=" + packageName)))) {
            return true;
        }
        return openExternally(ctx, new Intent(Intent.ACTION_VIEW,
                Uri.parse("market://details?id=" + packageName)));
    }

    private boolean installed(String packageName) {
        try {
            getContext().getPackageManager().getPackageInfo(packageName, 0);
            return true;
        } catch (PackageManager.NameNotFoundException e) {
            return false;
        }
    }
}