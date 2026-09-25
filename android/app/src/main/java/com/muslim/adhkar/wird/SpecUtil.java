package com.muslim.adhkar.wird;

import org.json.JSONArray;
import org.json.JSONObject;

/** استخراج مفردات المواصفة JSON الشائعة بين العرض والتحديث. */
final class SpecUtil {

    private SpecUtil() {
    }

    static JSONObject currentItem(JSONObject spec) {
        JSONArray items = spec.optJSONArray("items");
        if (items == null || items.length() == 0) return null;
        int idx = Math.min(Math.max(0, spec.optInt("index", 0)), items.length() - 1);
        return items.optJSONObject(idx);
    }

    static int itemCount(JSONObject spec) {
        JSONArray items = spec.optJSONArray("items");
        return items == null ? 0 : items.length();
    }
}