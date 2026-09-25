package com.muslim.adhkar.wird;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.view.WindowManager;

import androidx.core.app.NotificationCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * خدمة أمامية تستضيف نوافذ الودجات العائمة فوق كل التطبيقات وعلى شاشة القفل
 * (Android 10+). تُعاد بناؤها من التخزين المحلي عند كل تغيير، فتعمل حتى
 * بغياب التطبيق أو بعد إعادة تشغيل الجهاز.
 */
public class FloatingWidgetsService extends Service implements FloatingWidgetView.Listener {

    public static final String CHANNEL_ID = "adhkar_widgets_fg";
    private static final int NOTIFICATION_ID = 4102;

    private final List<FloatingWidgetView> views = new ArrayList<>();
    private WindowManager wm;

    public static void refresh(Context ctx) {
        Intent i = new Intent(ctx, FloatingWidgetsService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ctx.startForegroundService(i);
        } else {
            ctx.startService(i);
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        wm = (WindowManager) getSystemService(WINDOW_SERVICE);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startForeground(NOTIFICATION_ID, buildNotification());
        rebuildWindows();
        if (views.isEmpty()) {
            stopSelf();
        }
        return START_STICKY;
    }

    private Notification buildNotification() {
        ensureChannel();
        Intent launch = new Intent(this, MainActivity.class);
        PendingIntent content = PendingIntent.getActivity(
                this, 0, launch,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher_foreground)
                .setContentTitle("الودجات العائمة نشطة")
                .setContentText("سبحة، أدعية، أذكار وأوراد فوق الشاشة — اضغط مطولاً على ودجد لإخفائه أو حذفه")
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setOngoing(true)
                .setShowWhen(false)
                .setContentIntent(content)
                .build();
    }

    private void ensureChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            if (nm != null && nm.getNotificationChannel(CHANNEL_ID) == null) {
                NotificationChannel ch = new NotificationChannel(
                        CHANNEL_ID, "الودجات العائمة", NotificationManager.IMPORTANCE_LOW);
                ch.setShowBadge(false);
                nm.createNotificationChannel(ch);
            }
        }
    }

    private void rebuildWindows() {
        JSONArray arr = WidgetsPrefs.load(this);
        if (arr == null) arr = new JSONArray();

        // إزالة النوافذ التي حُذفت أو أُخفيت
        Iterator<FloatingWidgetView> it = views.iterator();
        while (it.hasNext()) {
            FloatingWidgetView v = it.next();
            String id = v.spec.optString("id", "");
            JSONObject cur = findSpec(arr, id);
            if (cur == null || !cur.optBoolean("visible", true)) {
                try {
                    wm.removeView(v);
                } catch (Exception ignored) {
                }
                it.remove();
            }
        }

        // إضافة المفقودة الظاهرة
        for (int i = 0; i < arr.length(); i++) {
            JSONObject s = arr.optJSONObject(i);
            if (s == null || !s.optBoolean("visible", true)) continue;
            if (findView(s.optString("id", "")) != null) continue;
            try {
                FloatingWidgetView v = new FloatingWidgetView(this, this, s);
                wm.addView(v, v.params);
                views.add(v);
            } catch (Exception ignored) {
            }
        }
    }

    private JSONObject findSpec(JSONArray arr, String id) {
        for (int i = 0; i < arr.length(); i++) {
            JSONObject o = arr.optJSONObject(i);
            if (o != null && id.equals(o.optString("id"))) return o;
        }
        return null;
    }

    private FloatingWidgetView findView(String id) {
        for (FloatingWidgetView v : views) {
            if (id.equals(v.spec.optString("id"))) return v;
        }
        return null;
    }

    @Override
    public void onWidgetChanged(FloatingWidgetView view) {
        // إعادة كتابة كل المواصفات (بمواضعها وعداداتها) من النوافذ الحية
        JSONArray arr = new JSONArray();
        int idx = -1;
        for (int i = 0; i < views.size(); i++) {
            FloatingWidgetView v = views.get(i);
            if (v == view) idx = i;
            arr.put(v.spec);
        }
        WidgetsPrefs.save(this, arr);
        if (idx >= 0) {
            // إعادة ضبط حجم النافذة بعد تغيّر المحتوى
            FloatingWidgetView v = views.get(idx);
            try {
                wm.updateViewLayout(v, v.params);
            } catch (Exception ignored) {
            }
        }
    }

    @Override
    public void onWidgetRemoved(FloatingWidgetView view) {
        try {
            wm.removeView(view);
        } catch (Exception ignored) {
        }
        views.remove(view);
        JSONArray arr = new JSONArray();
        for (FloatingWidgetView v : views) arr.put(v.spec);
        WidgetsPrefs.save(this, arr);
        if (views.isEmpty()) {
            stopSelf();
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        for (FloatingWidgetView v : views) {
            try {
                wm.removeView(v);
            } catch (Exception ignored) {
            }
        }
        views.clear();
        super.onDestroy();
    }
}