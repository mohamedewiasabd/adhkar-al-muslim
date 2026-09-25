package com.muslim.adhkar.wird;

import android.content.Context;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * ودجد عائم (نافذة فوق كل التطبيقات) بأربعة أنواع:
 *  - tasbeeh : زر عدّاد (نقرة = +1، عدد + دورات)
 *  - adhkar  : ذكر مع عدّاد يتقدّم للذكر التالي عند إتمام الهدف
 *  - dua     : دعاء اليوم (النقرة تنتقل للدعاء التالي)
 *  - awrad   : قائمة الورد اليومي بنسب التقدم (النقرة على بند = إتمام/إلغاء)
 * يُسحب بأي مكان في الشاشة، وتُحفظ مواضعه وعداداته محلياً لتعمل خارج التطبيق.
 */
public class FloatingWidgetView extends FrameLayout {

    interface Listener {
        void onWidgetChanged(FloatingWidgetView view);

        void onWidgetRemoved(FloatingWidgetView view);
    }

    final JSONObject spec;
    final WindowManager.LayoutParams params;
    private final Context ctx;
    private final Listener listener;
    private final String type;
    private final int widthDp;
    private final int[] colors;

    private WidgetViews views;

    private float startX, startY, rawStartX, rawStartY;
    private boolean dragged = false;
    private boolean touching = false;
    private boolean footerOpen = false;

    FloatingWidgetView(Context ctx, Listener listener, JSONObject spec) {
        super(ctx);
        this.ctx = ctx;
        this.listener = listener;
        this.spec = spec;

        this.type = spec.optString("type", "tasbeeh");
        String size = spec.optString("size", "medium");
        if ("small".equals(size)) widthDp = 170;
        else if ("large".equals(size)) widthDp = 300;
        else widthDp = 230;

        this.colors = new int[]{FloatingWidgetUi.themeColor(type), FloatingWidgetUi.themeDark(type)};

        int x = spec.optInt("x", 60);
        int y = spec.optInt("y", 320);

        params = new WindowManager.LayoutParams(
                FloatingWidgetUi.dp(ctx, widthDp),
                FloatingWidgetUi.dp(ctx, 160),
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                        ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                        : WindowManager.LayoutParams.TYPE_PHONE,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                        | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
                        | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                PixelFormat.TRANSLUCENT);
        params.gravity = Gravity.TOP | Gravity.START;
        params.x = Math.max(x, -FloatingWidgetUi.dp(ctx, 40));
        params.y = Math.max(y, -FloatingWidgetUi.dp(ctx, 20));

        // إظهار فوق شاشة القفل عند إيقاظ الجهاز (API 29+ / المضغوط عبر الانعكاس للتوافق)
        if (Build.VERSION.SDK_INT >= 29) {
            try {
                java.lang.reflect.Method m = params.getClass().getMethod("setShowOverLockscreen", boolean.class);
                m.invoke(params, true);
            } catch (Throwable ignored) {
            }
        }

        buildUi();
        refresh();
        setPadding(dp(0), dp(0), dp(0), dp(0));
    }

    private int dp(int value) {
        return FloatingWidgetUi.dp(ctx, value);
    }

    private void buildUi() {
        views = WidgetFactory.build(ctx, type, spec, colors, v -> hide(), v -> remove());
        addView(views.bg, new FrameLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));
        bindTouch();
    }

    /** يعيد بناء المحتوى من المواصفات الحالية. */
    void refresh() {
        WidgetRefresh.apply(this, ctx, views, spec, type, params, widthDp,
                () -> listener.onWidgetChanged(this));
    }

    private void performTap() {
        if (footerOpen) {
            toggleFooter();
            return;
        }
        try {
            int vib = WidgetTapAction.handleTap(spec, type);
            if (vib > 0) vibrate(vib);
            refresh();
            listener.onWidgetChanged(this);
        } catch (JSONException ignored) {
        }
    }

    private void toggleFooter() {
        footerOpen = !footerOpen;
        views.footer.setVisibility(footerOpen ? VISIBLE : GONE);
    }

    private void hide() {
        try {
            spec.put("visible", false);
        } catch (JSONException ignored) {
        }
        footerOpen = false;
        listener.onWidgetChanged(this);
        listener.onWidgetRemoved(this);
    }

    private void remove() {
        try {
            spec.put("visible", false);
        } catch (JSONException ignored) {
        }
        footerOpen = false;
        listener.onWidgetRemoved(this);
    }

    private void vibrate(int ms) {
        try {
            Vibrator v = (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
            if (v != null && v.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    v.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    v.vibrate(ms);
                }
            }
        } catch (Exception ignored) {
        }
    }

    private void bindTouch() {
        View.OnTouchListener touch = (v, event) -> handleTouch(event);
        views.content.setOnTouchListener(touch);
        setOnTouchListener(touch);
    }

    private boolean handleTouch(MotionEvent event) {
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                touching = true;
                dragged = false;
                startX = params.x;
                startY = params.y;
                rawStartX = event.getRawX();
                rawStartY = event.getRawY();
                return true;
            case MotionEvent.ACTION_MOVE: {
                if (!touching) return false;
                float dx = event.getRawX() - rawStartX;
                float dy = event.getRawY() - rawStartY;
                if (!dragged && (Math.abs(dx) > dp(12) || Math.abs(dy) > dp(12))) {
                    dragged = true;
                }
                if (dragged) {
                    params.x = Math.round(startX + dx);
                    params.y = Math.round(startY + dy);
                    try {
                        WindowManager wm = (WindowManager) ctx.getSystemService(Context.WINDOW_SERVICE);
                        wm.updateViewLayout(this, params);
                    } catch (Exception ignored) {
                    }
                }
                return true;
            }
            case MotionEvent.ACTION_UP:
            case MotionEvent.ACTION_CANCEL: {
                boolean wasDragged = dragged;
                touching = false;
                dragged = false;
                if (!wasDragged) {
                    performTap();
                } else {
                    try {
                        spec.put("x", params.x);
                        spec.put("y", params.y);
                    } catch (JSONException ignored) {
                    }
                    listener.onWidgetChanged(this);
                }
                return true;
            }
        }
        return false;
    }
}