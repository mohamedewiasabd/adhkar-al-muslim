package com.muslim.adhkar.wird;

import android.app.Activity;
import android.app.NotificationManager;
import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.WindowManager;
import android.widget.TextView;

/**
 * شاشة الدعاء كاملة (منتصف الشاشة) التي تظهر فوق القفل/أثناء إغلاق التطبيق.
 * تعرض الدعاء مع فضله ومصدره ثم تُغلق نفسها تلقائياً بعد 12 ثانية.
 */
public class DuaReminderActivity extends Activity {

    private static final long AUTO_DISMISS_MS = 12_000L;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable dismissRunnable = this::finishAndCleanup;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // إضاءة الشاشة وإظهارها حتى فوق القفل
        getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                        | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
                        | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                        | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);

        setContentView(R.layout.activity_dua_reminder);

        String title = getStringExtra(DuaReminderOverlayLauncher.EXTRA_TITLE, "دعاء للطمأنينة 🌿");
        String text = getStringExtra(DuaReminderOverlayLauncher.EXTRA_TEXT, "﴿ سُبْحَانَ اللَّهِ ﴾");
        String benefit = getStringExtra(DuaReminderOverlayLauncher.EXTRA_BENEFIT, "");
        String reference = getStringExtra(DuaReminderOverlayLauncher.EXTRA_REFERENCE, "");
        int noteId = getIntent().getIntExtra(DuaReminderOverlayLauncher.EXTRA_NOTE_ID, 0);

        // إزالة إشعار القناة من الظل بعد ظهور الشاشة الفعلية
        if (noteId != 0) {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) nm.cancel(noteId);
        }

        ((TextView) findViewById(R.id.dua_title)).setText(title);
        ((TextView) findViewById(R.id.dua_text)).setText(text);

        TextView benefitView = findViewById(R.id.dua_benefit);
        if (benefit != null && !benefit.isEmpty()) {
            benefitView.setText(String.format("✨ %s", benefit));
            benefitView.setVisibility(View.VISIBLE);
        } else {
            benefitView.setVisibility(View.GONE);
        }

        TextView referenceView = findViewById(R.id.dua_reference);
        if (reference != null && !reference.isEmpty()) {
            referenceView.setText(String.format("[%s]", reference));
            referenceView.setVisibility(View.VISIBLE);
        } else {
            referenceView.setVisibility(View.GONE);
        }

        TextView closeBtn = findViewById(R.id.dua_close);
        closeBtn.setOnClickListener(v -> finishAndCleanup());

        // أي نقرة على الخلفية تغلق الواجهة
        findViewById(R.id.dua_root).setOnClickListener(v -> finishAndCleanup());

        // إغلاق تلقائي بعد 12 ثانية
        handler.postDelayed(dismissRunnable, AUTO_DISMISS_MS);
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacks(dismissRunnable);
        super.onDestroy();
    }

    private void finishAndCleanup() {
        if (!isFinishing()) {
            finish();
        }
    }

    private String getStringExtra(String key, String def) {
        String v = getIntent().getStringExtra(key);
        return (v == null || v.isEmpty()) ? def : v;
    }
}