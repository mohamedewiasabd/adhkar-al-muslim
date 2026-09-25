package com.muslim.adhkar.wird;

import android.content.Context;
import android.graphics.Color;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

import org.json.JSONObject;

/** يبني جسم الودجد (الرأس + المحتوى حسب النوع + شريط الإجراءات). */
final class WidgetFactory {

    private WidgetFactory() {
    }

    static WidgetViews build(Context ctx, String type, JSONObject spec, int[] colors,
                             View.OnClickListener onHide, View.OnClickListener onRemove) {
        WidgetViews v = new WidgetViews();

        v.root = new LinearLayout(ctx);
        v.root.setOrientation(LinearLayout.VERTICAL);
        v.root.setGravity(Gravity.CENTER_HORIZONTAL);
        v.bg = FloatingWidgetUi.roundedBg(ctx, colors, 20);
        FrameLayout.LayoutParams wrap = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        v.bg.addView(v.root, wrap);

        // الرأس: العنوان + شريط القفل/الحذف
        v.titleView = FloatingWidgetUi.text(ctx, spec.optString("title", "—"), 13, Color.WHITE, true);
        v.titleView.setGravity(Gravity.CENTER);
        v.titleView.setPadding(FloatingWidgetUi.dp(ctx, 8), FloatingWidgetUi.dp(ctx, 8),
                FloatingWidgetUi.dp(ctx, 8), FloatingWidgetUi.dp(ctx, 4));
        v.root.addView(v.titleView,
                new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        v.content = new LinearLayout(ctx);
        v.content.setOrientation(LinearLayout.VERTICAL);
        v.content.setGravity(Gravity.CENTER);
        v.root.addView(v.content,
                new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        if ("tasbeeh".equals(type) || "adhkar".equals(type)) {
            v.bigView = FloatingWidgetUi.text(ctx, "0", 34, Color.WHITE, true);
            v.bigView.setGravity(Gravity.CENTER);
            v.content.addView(v.bigView,
                    new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

            LinearLayout row = new LinearLayout(ctx);
            row.setGravity(Gravity.CENTER);
            row.setOrientation(LinearLayout.HORIZONTAL);
            v.content.addView(row,
                    new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

            v.subView = FloatingWidgetUi.text(ctx, "—", 11, Color.argb(220, 255, 255, 255), false);
            v.subView.setGravity(Gravity.CENTER);
            row.addView(v.subView);

            if ("tasbeeh".equals(type)) {
                v.chipView = FloatingWidgetUi.text(ctx, "دورة 0", 10, Color.WHITE, true);
                v.chipView.setBackground(FloatingWidgetUi.pill(ctx, Color.argb(120, 255, 255, 255)));
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                        ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
                lp.setMargins(FloatingWidgetUi.dp(ctx, 6), 0, 0, 0);
                row.addView(v.chipView, lp);
            }
        } else if ("dua".equals(type)) {
            v.bigView = FloatingWidgetUi.text(ctx, spec.optString("itemText", "—"), 15, Color.WHITE, false);
            v.bigView.setGravity(Gravity.CENTER);
            v.bigView.setLineSpacing(0, 1.1f);
            v.bigView.setPadding(FloatingWidgetUi.dp(ctx, 10), FloatingWidgetUi.dp(ctx, 2),
                    FloatingWidgetUi.dp(ctx, 10), FloatingWidgetUi.dp(ctx, 2));
            v.content.addView(v.bigView,
                    new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

            v.chipView = FloatingWidgetUi.text(ctx, "المس للدعاء التالي", 10, Color.argb(220, 255, 255, 255), false);
            v.chipView.setGravity(Gravity.CENTER);
            v.chipView.setPadding(0, FloatingWidgetUi.dp(ctx, 6), 0, FloatingWidgetUi.dp(ctx, 4));
            v.content.addView(v.chipView);
        } else { // awrad
            v.itemsList = new LinearLayout(ctx);
            v.itemsList.setOrientation(LinearLayout.VERTICAL);
            v.content.addView(v.itemsList,
                    new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

            v.bigView = FloatingWidgetUi.text(ctx, "0/0", 13, Color.WHITE, true);
            v.bigView.setGravity(Gravity.CENTER);
            v.bigView.setPadding(0, FloatingWidgetUi.dp(ctx, 2), 0, FloatingWidgetUi.dp(ctx, 2));
            v.content.addView(v.bigView);
        }

        // شريط الإجراءات (يظهر بالضغط المطول): إخفاء + حذف
        v.footer = new LinearLayout(ctx);
        v.footer.setOrientation(LinearLayout.HORIZONTAL);
        v.footer.setGravity(Gravity.CENTER);
        v.footer.setVisibility(View.GONE);
        LinearLayout.LayoutParams flp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        flp.setMargins(FloatingWidgetUi.dp(ctx, 8), FloatingWidgetUi.dp(ctx, 2),
                FloatingWidgetUi.dp(ctx, 8), FloatingWidgetUi.dp(ctx, 6));
        v.root.addView(v.footer, flp);

        v.footer.addView(FloatingWidgetUi.actionButton(ctx, "إخفاء", onHide));
        v.footer.addView(FloatingWidgetUi.actionButton(ctx, "حذف", onRemove));

        return v;
    }
}