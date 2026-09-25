package com.muslim.adhkar.wird;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * تخزين ومشاركة بيانات ودجد «المسبحة»:
 * - قائمة الأذكار المخصّصة (نص + العدد لكل ذكر) تأتي من إعدادات التطبيق (JS)
 *   وتُخزَّن تفضيل موحّدة يقرؤها الودجد.
 * - إدارة حالة العدّاد (الذكر الحالي، العدد، الدورات) لكل ودجد على حدة.
 */
final class CounterWidgetStore {

    static final String PREFS = "adhkar_home_counter_v1";
    static final String ACTION_TAP = "com.muslim.adhkar.wird.HOME_COUNTER_TAP";
    static final String ACTION_NEXT = "com.muslim.adhkar.wird.HOME_COUNTER_NEXT";
    static final String ACTION_PREV = "com.muslim.adhkar.wird.HOME_COUNTER_PREV";
    static final String ACTION_RESET = "com.muslim.adhkar.wird.HOME_COUNTER_RESET";

    private CounterWidgetStore() {
    }

    static final class Item {
        final String text;
        final int count;

        Item(String t, int c) {
            text = t;
            count = c;
        }
    }

    static List<Item> defaultItems() {
        List<Item> list = new ArrayList<>();
        list.add(new Item("سبحان الله", 33));
        list.add(new Item("الحمد لله", 33));
        list.add(new Item("الله أكبر", 34));
        list.add(new Item("لا إله إلا الله", 33));
        return list;
    }

    static List<Item> loadItems(Context ctx) {
        List<Item> out = new ArrayList<>();
        try {
            String raw = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString("items", "");
            JSONArray arr = new JSONArray(raw);
            for (int i = 0; i < arr.length(); i++) {
                JSONObject o = arr.optJSONObject(i);
                if (o == null) continue;
                String text = o.optString("text", "").trim();
                int count = o.optInt("count", 33);
                if (text.isEmpty()) continue;
                if (count < 1) count = 1;
                out.add(new Item(text, count));
            }
        } catch (Exception ignored) {
        }
        if (out.isEmpty()) return defaultItems();
        return out;
    }

    static void storeItems(Context ctx, String itemsJson) {
        String value = "[]";
        if (itemsJson != null && !itemsJson.trim().isEmpty()) {
            try {
                JSONArray arr = new JSONArray(itemsJson);
                JSONArray clean = new JSONArray();
                for (int i = 0; i < arr.length(); i++) {
                    JSONObject o = arr.optJSONObject(i);
                    if (o == null) continue;
                    String text = o.optString("text", "").trim();
                    int count = o.optInt("count", 33);
                    if (text.isEmpty()) continue;
                    if (count < 1) count = 1;
                    JSONObject item = new JSONObject();
                    item.put("text", text);
                    item.put("count", count);
                    clean.put(item);
                }
                value = clean.toString();
            } catch (Exception ignored) {
            }
        }
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit().putString("items", value).apply();
    }

    static int loadIndex(Context ctx, int widgetId, int size) {
        int idx = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getInt("idx_" + widgetId, 0);
        if (size <= 0) return 0;
        if (idx < 0) return 0;
        if (idx >= size) return size - 1;
        return idx;
    }

    static int loadLaps(Context ctx, int widgetId) {
        return ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getInt("laps_" + widgetId, 0);
    }

    static int loadCount(Context ctx, int widgetId) {
        return ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getInt("count_" + widgetId, 0);
    }

    static void saveState(Context ctx, int widgetId, int index, int count, int laps) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit()
                .putInt("idx_" + widgetId, index)
                .putInt("count_" + widgetId, count)
                .putInt("laps_" + widgetId, laps)
                .apply();
    }

    static void renderAll(Context ctx) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        if (mgr == null) return;
        int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, HomeCounterProvider.class));
        for (int id : ids) HomeCounterProvider.renderWidget(ctx, mgr, id);
        WidgetsHeartbeatReceiver.schedule(ctx);
    }

    /** تحويل الأرقام إلى أرقام عربية مشرقية (٠-٩). */
    static String arNum(int n) {
        StringBuilder sb = new StringBuilder();
        for (char c : String.valueOf(n).toCharArray()) {
            if (c >= '0' && c <= '9') sb.append((char) ('٠' + (c - '0')));
            else sb.append(c);
        }
        return sb.toString();
    }
}