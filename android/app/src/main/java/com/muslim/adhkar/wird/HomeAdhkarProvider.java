package com.muslim.adhkar.wird;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * ودجد «أذكار الصباح / المساء» على الشاشة الرئيسية:
 * سطر لكل ذكر، والضغط على السطر يعلّمه كمُنجز لهذا اليوم.
 * يُصَفَّر تلقائياً في اليوم التالي. فئتان فرعيتان: صباح ومساء.
 */
abstract class HomeAdhkarProvider extends AppWidgetProvider {

    private static final String PREFS = "adhkar_home_checklists_v1";

    protected abstract String brand();

    protected abstract int bgRes();

    private String actionTap() {
        return "com.muslim.adhkar.wird.HOME_ADHKAR_TAP" + brand();
    }

    private String[] items() {
        if ("evening".equals(brand())) {
            return new String[]{
                    "أعوذ بكلمات الله التامات من شر ما خلق",
                    "اللهم بك أمسينا",
                    "سورة الإخلاص — 3",
                    "المعوذتين — 3"
            };
        }
        return new String[]{
                "سيد الاستغفار",
                "اللهم بك أصبحنا",
                "آية الكرسي",
                "سورة الإخلاص — 3"
        };
    }

    private String todayKey() {
        return new SimpleDateFormat("yyyyMMdd", Locale.US).format(new Date());
    }

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) render(ctx, mgr, id);
    }

    @Override
    public void onReceive(Context ctx, Intent intent) {
        super.onReceive(ctx, intent);
        if (!actionTap().equals(intent.getAction())) return;
        int id = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        int row = intent.getIntExtra("row", -1);
        if (id == AppWidgetManager.INVALID_APPWIDGET_ID || row < 0 || row > 3) return;
        SharedPreferences sp = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        if (!todayKey().equals(sp.getString("date_" + id, ""))) {
            sp.edit().remove("r0_" + id).remove("r1_" + id).remove("r2_" + id).remove("r3_" + id)
                    .putString("date_" + id, todayKey()).apply();
        }
        boolean done = sp.getBoolean("r" + row + "_" + id, false);
        sp.edit().putBoolean("r" + row + "_" + id, !done).apply();
        render(ctx, AppWidgetManager.getInstance(ctx), id);
    }

    private void render(Context ctx, AppWidgetManager mgr, int widgetId) {
        SharedPreferences sp = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        boolean fresh = todayKey().equals(sp.getString("date_" + widgetId, ""));
        String[] items = items();
        RemoteViews views = new RemoteViews(ctx.getPackageName(), R.layout.widget_adhkar_checklist);

        views.setInt(R.id.adhkar_root, "setBackgroundResource", bgRes());
        views.setTextViewText(R.id.adhkar_title,
                "evening".equals(brand()) ? "أذكار المساء" : "أذكار الصباح");

        int[] checks = {R.id.adhkar_check0, R.id.adhkar_check1, R.id.adhkar_check2, R.id.adhkar_check3};
        int[] titles = {R.id.adhkar_title0, R.id.adhkar_title1, R.id.adhkar_title2, R.id.adhkar_title3};
        int[] rows = {R.id.adhkar_row0, R.id.adhkar_row1, R.id.adhkar_row2, R.id.adhkar_row3};

        for (int i = 0; i < 4; i++) {
            boolean done = fresh && sp.getBoolean("r" + i + "_" + widgetId, false);
            views.setTextViewText(titles[i], (done ? "✓ " : "") + items[i]);
            views.setTextViewText(checks[i], done ? "●" : "○");

            Intent tap = new Intent(ctx, getClass()).setAction(actionTap());
            tap.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId);
            tap.putExtra("row", i);
            views.setOnClickPendingIntent(rows[i],
                    PendingIntent.getBroadcast(ctx, widgetId * 10 + i, tap,
                            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
        }

        int doneCount = 0;
        for (int i = 0; i < 4; i++) {
            if (fresh && sp.getBoolean("r" + i + "_" + widgetId, false)) doneCount++;
        }
        views.setTextViewText(R.id.adhkar_footer,
                doneCount == 4 ? "أتممت أذكار اليوم ✓ — يصفّر غداً" : "أنجزت " + doneCount + " من 4 — يصفّر كل يوم");

        mgr.updateAppWidget(widgetId, views);
    }
}