package com.muslim.adhkar.wird;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

import java.util.List;

/**
 * ودجد «المسبحة» على الشاشة الرئيسية:
 * - يعرض قائمة الأذكار المخصّصة من إعدادات التطبيق كل ذكرٍ بعددٍ خاص به.
 * - اضغط الودجد للعدّ؛ عند إتمام عدد الذكر الحالي ينتقل تلقائياً للتالي بالترتيب.
 * - زرّا «التالي/السابق» للاختيار اليدوي للذكر، و«إعادة» لتصفير الحساب.
 * يُحفظ العدد محلياً؛ لا يحتاج التطبيق مفتوحاً.
 */
public class HomeCounterProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) renderWidget(ctx, mgr, id);
        WidgetsHeartbeatReceiver.schedule(ctx);
    }

    @Override
    public void onReceive(Context ctx, Intent intent) {
        super.onReceive(ctx, intent);
        String action = intent.getAction();
        int id = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        if (id == AppWidgetManager.INVALID_APPWIDGET_ID) return;

        List<CounterWidgetStore.Item> items = CounterWidgetStore.loadItems(ctx);
        int size = items.size();
        int idx = CounterWidgetStore.loadIndex(ctx, id, size);
        int count = CounterWidgetStore.loadCount(ctx, id);
        int laps = CounterWidgetStore.loadLaps(ctx, id);

        if (CounterWidgetStore.ACTION_TAP.equals(action)) {
            count += 1;
            if (count >= items.get(idx).count) {
                if (idx + 1 >= size) {
                    idx = 0;
                    laps += 1;
                } else {
                    idx += 1;
                }
                count = 0;
            }
        } else if (CounterWidgetStore.ACTION_NEXT.equals(action)) {
            idx = (idx + 1) % size;
            count = 0;
        } else if (CounterWidgetStore.ACTION_PREV.equals(action)) {
            idx = (idx - 1 + size) % size;
            count = 0;
        } else if (CounterWidgetStore.ACTION_RESET.equals(action)) {
            idx = 0;
            count = 0;
            laps = 0;
        } else {
            return;
        }

        CounterWidgetStore.saveState(ctx, id, idx, count, laps);
        renderWidget(ctx, AppWidgetManager.getInstance(ctx), id);
    }

    /** يُرسم ودجداً واحداً. مُتاح للمكوّنات (CounterWidgetStore) لإعادة الرسم. */
    static void renderWidget(Context ctx, AppWidgetManager mgr, int widgetId) {
        List<CounterWidgetStore.Item> items = CounterWidgetStore.loadItems(ctx);
        int size = items.size();
        int idx = CounterWidgetStore.loadIndex(ctx, widgetId, size);
        int count = CounterWidgetStore.loadCount(ctx, widgetId);
        int laps = CounterWidgetStore.loadLaps(ctx, widgetId);
        CounterWidgetStore.Item item = items.get(idx);

        RemoteViews views = new RemoteViews(ctx.getPackageName(), R.layout.widget_counter);
        views.setTextViewText(R.id.widget_title, item.text + " · " + CounterWidgetStore.arNum(item.count));
        views.setTextViewText(R.id.widget_count, CounterWidgetStore.arNum(count));
        views.setTextViewText(R.id.widget_pos, CounterWidgetStore.arNum(idx + 1) + "/" + CounterWidgetStore.arNum(size));
        views.setTextViewText(R.id.widget_laps, "الدورات: " + CounterWidgetStore.arNum(laps));

        views.setOnClickPendingIntent(R.id.widget_body, tap(ctx, widgetId, CounterWidgetStore.ACTION_TAP));
        views.setOnClickPendingIntent(R.id.widget_next, tap(ctx, widgetId + 3000, CounterWidgetStore.ACTION_NEXT));
        views.setOnClickPendingIntent(R.id.widget_prev, tap(ctx, widgetId + 4000, CounterWidgetStore.ACTION_PREV));
        views.setOnClickPendingIntent(R.id.widget_reset, tap(ctx, widgetId + 1000, CounterWidgetStore.ACTION_RESET));

        mgr.updateAppWidget(widgetId, views);
    }

    private static PendingIntent tap(Context ctx, int requestCode, String action) {
        int widgetId = requestCode >= 4000 ? requestCode - 4000
                : requestCode >= 3000 ? requestCode - 3000
                : requestCode >= 1000 ? requestCode - 1000
                : requestCode;
        Intent intent = new Intent(ctx, HomeCounterProvider.class).setAction(action);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId);
        return PendingIntent.getBroadcast(ctx, requestCode, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}