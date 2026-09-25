package com.muslim.adhkar.wird;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

/**
 * تسجيل المكوّنات (Plugins) الأصلية لـ Capacitor.
 * في هذا الإصدار من Capacitor يجب أن تتمّ registerPlugin() قبل super.onCreate()
 * حتى تُستهلك القائمة initialPlugins داخل BridgeActivity.load() عند بناء الجسر,
 * وإلا فالمكوّنات لا تُسجَّل في الجسر الفعلي ويظهر خطأ
 * «"X" plugin is not implemented on android» عند كل استدعاء.
 */
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(BatteryOptimizerPlugin.class);
        registerPlugin(DuaReminderPlugin.class);
        registerPlugin(ExactAlarmPlugin.class);
        registerPlugin(GallerySaverPlugin.class);
        registerPlugin(OverlayWidgetsPlugin.class);
        registerPlugin(PrayerWidgetsPlugin.class);
        registerPlugin(TasbeehWidgetsPlugin.class);
        registerPlugin(OurAppsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}