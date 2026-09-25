package com.muslim.adhkar.wird;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

/**
 * ودجد «أسماء الله الحسنى» على الشاشة الرئيسية:
 * يعرض اسم الله ومعناه، والضغط ينتقل للاسم التالي.
 */
public class HomeAsmaProvider extends AppWidgetProvider {

    private static final String ACTION_NEXT = "com.muslim.adhkar.wird.HOME_ASMA_NEXT";
    private static final String PREFS = "adhkar_home_asma_v1";

    private static final String[][] ASMA = {
            {"الرحمن", "ذو الرحمة الواسعة"},
            {"الرحيم", "المتفضل على عباده بالإحسان"},
            {"الملك", "المالك لجميع الأشياء المتصرف فيها بلا ممانع"},
            {"القدوس", "المنزه عن كل نقص وعيب"},
            {"السلام", "السالم من كل عيب والمانح السلامة"},
            {"المؤمن", "المانح الأمن والطمأنينة لعباده"},
            {"المهيمن", "الرقيب الحافظ لخلقه"},
            {"العزيز", "الغالب القوي الذي لا يُغالَب"},
            {"القهار", "القاهر فوق عباده الجبار"},
            {"الوكيل", "الكافي لمن توكل عليه"}
    };

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) render(ctx, mgr, id);
    }

    @Override
    public void onReceive(Context ctx, Intent intent) {
        super.onReceive(ctx, intent);
        if (!ACTION_NEXT.equals(intent.getAction())) return;
        int id = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        if (id == AppWidgetManager.INVALID_APPWIDGET_ID) return;
        SharedPreferences sp = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        int idx = (sp.getInt("index_" + id, 0) + 1) % ASMA.length;
        sp.edit().putInt("index_" + id, idx).apply();
        render(ctx, AppWidgetManager.getInstance(ctx), id);
    }

    private void render(Context ctx, AppWidgetManager mgr, int widgetId) {
        SharedPreferences sp = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        int idx = sp.getInt("index_" + widgetId, 0) % ASMA.length;
        RemoteViews views = new RemoteViews(ctx.getPackageName(), R.layout.widget_asma);
        views.setTextViewText(R.id.widget_asma_name, ASMA[idx][0]);
        views.setTextViewText(R.id.widget_asma_meaning, ASMA[idx][1]);
        views.setTextViewText(R.id.widget_asma_index, "المس للتالي — " + (idx + 1) + "/" + ASMA.length);

        Intent next = new Intent(ctx, HomeAsmaProvider.class).setAction(ACTION_NEXT);
        next.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId);
        views.setOnClickPendingIntent(R.id.widget_asma_body,
                PendingIntent.getBroadcast(ctx, widgetId + 3000, next,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

        mgr.updateAppWidget(widgetId, views);
    }
}