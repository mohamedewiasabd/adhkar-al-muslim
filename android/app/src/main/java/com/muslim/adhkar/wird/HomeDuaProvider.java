package com.muslim.adhkar.wird;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

/**
 * ودجد «دعاء اليوم» على الشاشة الرئيسية:
 * - يعرض دعاءً مأثوراً، والضغط على الودجد ينتقل للدعاء التالي.
 * لا يحتاج التطبيق مفتوحاً.
 */
public class HomeDuaProvider extends AppWidgetProvider {

    private static final String ACTION_NEXT = "com.muslim.adhkar.wird.HOME_DUA_NEXT";
    private static final String PREFS = "adhkar_home_dua_v1";

    private static final String[] DUAS = {
            "اللهم إني أسألك الهدى والتقى والعفاف والغنى",
            "اللهم إني أعوذ بك من الهم والحزن والعجز والكسل والبخل والجبن وضلع الدين وغلبة الرجال",
            "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
            "اللهم أعني على ذكرك وشكرك وحسن عبادتك",
            "اللهم إني أسألك العفو والعافية في الدنيا والآخرة"
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
        int idx = (sp.getInt("index_" + id, 0) + 1) % DUAS.length;
        sp.edit().putInt("index_" + id, idx).apply();
        render(ctx, AppWidgetManager.getInstance(ctx), id);
    }

    private void render(Context ctx, AppWidgetManager mgr, int widgetId) {
        SharedPreferences sp = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        int idx = sp.getInt("index_" + widgetId, 0) % DUAS.length;
        RemoteViews views = new RemoteViews(ctx.getPackageName(), R.layout.widget_dua);
        views.setTextViewText(R.id.widget_dua_text, DUAS[idx]);
        views.setTextViewText(R.id.widget_dua_index, "المس للمزيد — " + (idx + 1) + "/" + DUAS.length);

        Intent next = new Intent(ctx, HomeDuaProvider.class).setAction(ACTION_NEXT);
        next.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId);
        views.setOnClickPendingIntent(R.id.widget_dua_body,
                PendingIntent.getBroadcast(ctx, widgetId + 2000, next,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

        mgr.updateAppWidget(widgetId, views);
    }
}