package com.muslim.adhkar.wird;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.SystemClock;
import android.widget.RemoteViews;

import org.json.JSONObject;

import java.util.Calendar;

/**
 * نواة ودجد «الصلاة القادمة»:
 * - يحفظ مواقيت اليوم من الواجهة (JS) في تفضيلات الدفعة.
 * - يحسب الصلاة القادمة لاحقاً من ساعة الجهاز ويعرض البواقي.
 * - يخدّم عملاقة تحديث كل دقيقة عبر AlarmManager ليبقى العدّاد حيّاً.
 */
final class PrayerWidgetUpdater {

    private static final String PREFS = "prayer_widget_v1";
    private static final long UPDATE_INTERVAL_MS = 60_000L;
    private static final String[] PRAYER_KEYS = {"fajr", "dhuhr", "asr", "maghrib", "isha"};
    private static final String[] PRAYER_NAMES = {"الفجر", "الظهر", "العصر", "المغرب", "العشاء"};

    private PrayerWidgetUpdater() {
    }

    static JSONObject loadTimes(Context ctx) {
        SharedPreferences sp = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        JSONObject out = new JSONObject();
        try {
            out.put("date", sp.getString("date", ""));
            out.put("times", new JSONObject(sp.getString("times", "{}")));
        } catch (Exception ignored) {
        }
        return out;
    }

    static void storeTimes(Context ctx, String date, JSONObject times) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit()
                .putString("date", date == null ? "" : date)
                .putString("times", times == null ? "{}" : times.toString())
                .apply();
    }

    static void scheduleUpdates(Context ctx) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        Intent intent = new Intent(ctx, PrayerWidgetAlarmReceiver.class);
        PendingIntent pi = PendingIntent.getBroadcast(ctx, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        am.setWindow(AlarmManager.ELAPSED_REALTIME_WAKEUP,
                SystemClock.elapsedRealtime() + UPDATE_INTERVAL_MS,
                UPDATE_INTERVAL_MS, pi);
    }

    static void renderAll(Context ctx) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        if (mgr == null) return;
        int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, HomePrayerProvider.class));
        if (ids.length == 0) return;
        for (int id : ids) {
            render(ctx, mgr, id);
        }
        scheduleUpdates(ctx);
    }

    private static String fmt2(int n) {
        return n < 10 ? "0" + n : String.valueOf(n);
    }

    private static int parseHHMM(String s) {
        try {
            int idx = s.indexOf(':');
            if (idx <= 0 || idx >= s.length() - 1) return -1;
            int h = Integer.parseInt(s.substring(0, idx));
            int m = Integer.parseInt(s.substring(idx + 1));
            return h * 60 + m;
        } catch (Exception e) {
            return -1;
        }
    }

    private static String diffText(int diff) {
        if (diff <= 0) return "حان الوقت الآن";
        if (diff < 60) return "بعد " + diff + " دقيقة";
        int h = diff / 60;
        int m = diff % 60;
        if (m == 0) return "بعد " + h + " ساعة";
        return "بعد " + h + " س و " + m + " د";
    }

    private static void render(Context ctx, AppWidgetManager mgr, int widgetId) {
        RemoteViews views = new RemoteViews(ctx.getPackageName(), R.layout.widget_next_prayer);
        JSONObject data = loadTimes(ctx);
        JSONObject times = data.optJSONObject("times");

        Calendar cal = Calendar.getInstance();
        int nowMin = cal.get(Calendar.HOUR_OF_DAY) * 60 + cal.get(Calendar.MINUTE);

        boolean stale = false;
        String storedDate = data.optString("date", "");
        if (!storedDate.isEmpty()) {
            // التاريخ يُخزَّن من JS بصيغة YYYY-MM-DD
            String todayKey = cal.get(Calendar.YEAR) + "-" + fmt2(cal.get(Calendar.MONTH) + 1) + "-" + fmt2(cal.get(Calendar.DAY_OF_MONTH));
            if (!storedDate.startsWith(todayKey)) stale = true;
        }

        if (times == null || times.length() == 0 || stale) {
            views.setTextViewText(R.id.pt_name, "المواقيت");
            views.setTextViewText(R.id.pt_time, "--:--");
            views.setTextViewText(R.id.pt_countdown, "افتح التطبيق لتحديث المواقيت");
        } else {
            String nextName = null;
            int nextMin = Integer.MAX_VALUE;
            for (int i = 0; i < PRAYER_KEYS.length; i++) {
                int m = parseHHMM(times.optString(PRAYER_KEYS[i], ""));
                if (m < 0) continue;
                if (m > nowMin && m < nextMin) {
                    nextMin = m;
                    nextName = PRAYER_NAMES[i];
                }
            }
            String timeStr;
            if (nextName == null) {
                int fajrMin = parseHHMM(times.optString("fajr", ""));
                if (fajrMin >= 0) {
                    nextName = "الفجر";
                    nextMin = fajrMin + 1440;
                    timeStr = fmt2(fajrMin / 60) + ":" + fmt2(fajrMin % 60);
                } else {
                    timeStr = "--:--";
                }
            } else {
                timeStr = fmt2(nextMin / 60) + ":" + fmt2(nextMin % 60);
            }
            views.setTextViewText(R.id.pt_name, nextName == null ? "الأذان القادم" : nextName);
            views.setTextViewText(R.id.pt_time, timeStr);
            views.setTextViewText(R.id.pt_countdown, diffText(nextMin - nowMin));
        }

        Intent open = new Intent(ctx, MainActivity.class);
        PendingIntent pi = PendingIntent.getActivity(ctx, 0, open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.pt_body, pi);

        mgr.updateAppWidget(widgetId, views);
    }
}