package com.muslim.adhkar.wird;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;

/** حفظ/قراءة تعريفات الودجات العائمة محلياً (JSONArray من المواصفات). */
final class WidgetsPrefs {
    private static final String PREFS = "adhkar_overlay_widgets_v1";
    private static final String KEY = "widgets";

    private WidgetsPrefs() {
    }

    static synchronized JSONArray load(Context ctx) {
        try {
            String s = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY, "[]");
            return new JSONArray(s);
        } catch (Exception e) {
            return new JSONArray();
        }
    }

    static synchronized void save(Context ctx, JSONArray arr) {
        try {
            ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                    .edit().putString(KEY, arr.toString()).apply();
        } catch (Exception ignored) {
        }
    }
}