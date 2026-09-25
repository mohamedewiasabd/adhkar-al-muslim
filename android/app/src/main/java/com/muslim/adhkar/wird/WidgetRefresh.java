package com.muslim.adhkar.wird;

import android.content.Context;
import android.graphics.Color;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import org.json.JSONArray;
import org.json.JSONObject;

/** تحديث محتوى الودجد من المواصفات الحالية + إعادة ضبط الارتفاع. */
final class WidgetRefresh {

    private WidgetRefresh() {
    }

    static void apply(FloatingWidgetView view, Context ctx, WidgetViews v, JSONObject spec,
                      String type, WindowManager.LayoutParams params, int widthDp, Runnable onChanged) {
        JSONObject item = SpecUtil.currentItem(spec);
        if ("tasbeeh".equals(type)) {
            String title = spec.optString("title", "سبحة");
            v.titleView.setText(title);
            int count = spec.optInt("count", 0);
            int target = spec.optInt("target", 33);
            v.bigView.setText(String.valueOf(count));
            v.subView.setText(target <= 0 ? "∞" : "من أصل " + target);
            v.chipView.setText("دورة " + spec.optInt("laps", 0));
        } else if ("adhkar".equals(type)) {
            v.titleView.setText(spec.optString("title", "ذكر"));
            int count = item == null ? 0 : item.optInt("count", 0);
            int target = item == null ? 33 : item.optInt("target", 33);
            String text = item == null ? "—" : item.optString("text", "—");
            v.bigView.setText(text);
            if (v.bigView.length() > 40) v.bigView.setTextSize(24);
            v.subView.setText(count + " / " + target);
        } else if ("dua".equals(type)) {
            v.titleView.setText(spec.optString("title", "دعاء اليوم"));
            String text = item == null ? "—" : item.optString("text", "—");
            v.bigView.setText(text);
            int idx = spec.optInt("index", 0) + 1;
            int total = SpecUtil.itemCount(spec) == 0 ? 1 : SpecUtil.itemCount(spec);
            v.chipView.setText("دعاء " + idx + " من " + total + " — المس للتالي");
        } else { // awrad
            v.titleView.setText(spec.optString("title", "الورد اليومي"));
            renderAwrad(ctx, v, spec);
        }
        adaptHeight(view, ctx, v, params, widthDp, onChanged);
    }

    private static void renderAwrad(Context ctx, WidgetViews v, JSONObject spec) {
        JSONArray items = spec.optJSONArray("items");
        int done = 0;
        int total = items == null ? 0 : items.length();
        v.itemsList.removeAllViews();
        if (items != null) {
            for (int i = 0; i < items.length(); i++) {
                JSONObject it = items.optJSONObject(i);
                if (it == null) continue;
                int target = it.optInt("target", 1);
                int count = it.optInt("count", 0);
                boolean finished = it.optBoolean("done", false) || count >= target;
                if (finished) done++;

                LinearLayout row = new LinearLayout(ctx);
                row.setOrientation(LinearLayout.VERTICAL);
                android.graphics.drawable.GradientDrawable pill = new android.graphics.drawable.GradientDrawable();
                pill.setCornerRadius(FloatingWidgetUi.dp(ctx, 12));
                pill.setColor(Color.argb(60 - (finished ? 30 : 0), 255, 255, 255));
                row.setBackground(pill);
                row.setPadding(FloatingWidgetUi.dp(ctx, 8), FloatingWidgetUi.dp(ctx, 5),
                        FloatingWidgetUi.dp(ctx, 8), FloatingWidgetUi.dp(ctx, 5));

                TextView name = FloatingWidgetUi.text(ctx, it.optString("text", "بند"), 11, Color.WHITE, true);
                row.addView(name);
                ProgressBar pb = new ProgressBar(ctx, null, android.R.attr.progressBarStyleHorizontal);
                pb.setMax(Math.max(target, 1));
                pb.setProgress(Math.min(count, Math.max(target, 1)));
                pb.setProgressDrawable(FloatingWidgetUi.progressBar());
                LinearLayout.LayoutParams plp = new LinearLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT, FloatingWidgetUi.dp(ctx, 4));
                plp.setMargins(0, FloatingWidgetUi.dp(ctx, 3), 0, 0);
                row.addView(pb, plp);

                TextView sub = FloatingWidgetUi.text(ctx, finished ? "مكتمل ✓" : count + " / " + target, 9,
                        finished ? Color.argb(230, 255, 255, 255) : Color.argb(200, 255, 255, 255), false);
                sub.setGravity(Gravity.END);
                row.addView(sub);

                LinearLayout.LayoutParams rlp = new LinearLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
                rlp.setMargins(0, 0, 0, FloatingWidgetUi.dp(ctx, 3));
                v.itemsList.addView(row, rlp);
            }
        }
        v.bigView.setText(done + "/" + total + " منجز");
    }

    private static void adaptHeight(FloatingWidgetView view, Context ctx, WidgetViews v,
                                    WindowManager.LayoutParams params, int widthDp, Runnable onChanged) {
        v.content.measure(View.MeasureSpec.makeMeasureSpec(FloatingWidgetUi.dp(ctx, widthDp), View.MeasureSpec.AT_MOST),
                View.MeasureSpec.makeMeasureSpec(FloatingWidgetUi.dp(ctx, 600), View.MeasureSpec.AT_MOST));
        v.root.measure(View.MeasureSpec.makeMeasureSpec(FloatingWidgetUi.dp(ctx, widthDp), View.MeasureSpec.AT_MOST),
                View.MeasureSpec.makeMeasureSpec(FloatingWidgetUi.dp(ctx, 600), View.MeasureSpec.AT_MOST));
        int newH = v.root.getMeasuredHeight() + FloatingWidgetUi.dp(ctx, 8);
        params.height = Math.min(newH, FloatingWidgetUi.dp(ctx, 520));
        try {
            WindowManager wm = (WindowManager) ctx.getSystemService(Context.WINDOW_SERVICE);
            wm.updateViewLayout(view, params);
        } catch (Exception ignored) {
        }
        onChanged.run();
    }
}