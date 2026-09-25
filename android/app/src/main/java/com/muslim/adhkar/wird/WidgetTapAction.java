package com.muslim.adhkar.wird;

import org.json.JSONArray;
import org.json.JSONObject;

/** منطق النقرة الواحدة: تعديل المواصفة حسب النوع. يعيد مدة الاهتزاز بالملي ثانية (0 = بدون). */
final class WidgetTapAction {

    private WidgetTapAction() {
    }

    static int handleTap(JSONObject spec, String type) throws org.json.JSONException {
        if ("tasbeeh".equals(type) || "adhkar".equals(type)) {
            int target = spec.optInt("target", 33);
            JSONObject item = SpecUtil.currentItem(spec);
            if ("adhkar".equals(type) && item != null) {
                int count = item.optInt("count", 0) + 1;
                int tgt = item.optInt("target", 33);
                if (count >= tgt) {
                    item.put("count", 0);
                    int idx = spec.optInt("index", 0);
                    JSONArray items = spec.optJSONArray("items");
                    int next = (idx + 1) % (items == null ? 1 : Math.max(1, items.length()));
                    spec.put("index", next);
                    return 40;
                } else {
                    item.put("count", count);
                    return 0;
                }
            } else {
                int count = spec.optInt("count", 0) + 1;
                if (count >= target) {
                    spec.put("count", 0);
                    spec.put("laps", spec.optInt("laps", 0) + 1);
                } else {
                    spec.put("count", count);
                }
                return 16;
            }
        } else if ("dua".equals(type)) {
            int total = SpecUtil.itemCount(spec);
            spec.put("index", total == 0 ? 0 : (spec.optInt("index", 0) + 1) % total);
            return 12;
        } else { // awrad
            JSONArray items = spec.optJSONArray("items");
            if (items != null && items.length() > 0) {
                int idx = Math.min(Math.max(0, spec.optInt("index", 0)), items.length() - 1);
                JSONObject it = items.optJSONObject(idx);
                if (it != null) {
                    int target = it.optInt("target", 1);
                    boolean finished = it.optBoolean("done", false) || it.optInt("count", 0) >= target;
                    if (finished) {
                        it.put("done", false);
                        it.put("count", 0);
                    } else {
                        it.put("done", true);
                        it.put("count", target);
                    }
                }
                spec.put("index", (idx + 1) % items.length());
                return 12;
            }
        }
        return 0;
    }
}