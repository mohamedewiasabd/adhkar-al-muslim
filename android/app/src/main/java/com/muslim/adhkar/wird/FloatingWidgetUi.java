package com.muslim.adhkar.wird;

import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.GradientDrawable;
import android.graphics.drawable.LayerDrawable;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.TextView;

/** أدوات زخرفية مشتركة لبناء مظهر الودجات العائمة. */
final class FloatingWidgetUi {

    private FloatingWidgetUi() {
    }

    static int dp(Context ctx, int value) {
        return Math.round(value * ctx.getResources().getDisplayMetrics().density);
    }

    static int themeColor(String type) {
        switch (type) {
            case "dua": return 0xFFD97706;      // amber
            case "awrad": return 0xFF0284C7;    // sky
            case "adhkar": return 0xFF0D9488;   // teal
            default: return 0xFF059669;         // emerald
        }
    }

    static int themeDark(String type) {
        switch (type) {
            case "dua": return 0xFF92400E;
            case "awrad": return 0xFF075985;
            case "adhkar": return 0xFF115E59;
            default: return 0xFF047857;
        }
    }

    static FrameLayout roundedBg(Context ctx, int[] colors, int radiusDp) {
        GradientDrawable g = new GradientDrawable(
                GradientDrawable.Orientation.TL_BR, colors);
        g.setCornerRadius(dp(ctx, radiusDp));
        g.setStroke(dp(ctx, 1), Color.argb(90, 255, 255, 255));
        FrameLayout fl = new FrameLayout(ctx);
        fl.setBackground(g);
        return fl;
    }

    static TextView text(Context ctx, String text, float sp, int color, boolean bold) {
        TextView tv = new TextView(ctx);
        tv.setText(text);
        tv.setTextSize(sp);
        tv.setTextColor(color);
        if (bold) tv.setTypeface(android.graphics.Typeface.create("sans-serif", android.graphics.Typeface.BOLD));
        tv.setIncludeFontPadding(true);
        return tv;
    }

    static GradientDrawable pill(Context ctx, int strokeColor) {
        GradientDrawable pill = new GradientDrawable();
        pill.setCornerRadius(dp(ctx, 999));
        pill.setColor(Color.argb(80, 255, 255, 255));
        pill.setStroke(dp(ctx, 1), strokeColor);
        return pill;
    }

    static Drawable progressBar() {
        LayerDrawable ld = new LayerDrawable(new Drawable[]{
                new ColorDrawable(Color.argb(90, 255, 255, 255)),
                new ColorDrawable(Color.WHITE)
        });
        ld.setId(0, android.R.id.background);
        ld.setId(1, android.R.id.progress);
        return ld;
    }

    static TextView actionButton(Context ctx, String label, View.OnClickListener onClick) {
        TextView tv = text(ctx, label, 11, Color.WHITE, true);
        tv.setGravity(android.view.Gravity.CENTER);
        tv.setPadding(dp(ctx, 10), dp(ctx, 5), dp(ctx, 10), dp(ctx, 5));
        tv.setBackground(pill(ctx, Color.argb(120, 255, 255, 255)));
        tv.setOnClickListener(onClick);
        android.widget.LinearLayout.LayoutParams lp =
                new android.widget.LinearLayout.LayoutParams(
                        android.view.ViewGroup.LayoutParams.WRAP_CONTENT,
                        android.view.ViewGroup.LayoutParams.WRAP_CONTENT);
        lp.setMargins(dp(ctx, 4), 0, dp(ctx, 4), dp(ctx, 2));
        tv.setLayoutParams(lp);
        return tv;
    }
}