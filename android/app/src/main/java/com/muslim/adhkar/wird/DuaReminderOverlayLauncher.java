package com.muslim.adhkar.wird;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;

import androidx.core.app.NotificationCompat;

/**
 * يعرض الدعاء في واجهة كاملة DuaReminderActivity فوق كل شيء.
 *
 * عند تشغيل التطبيق (زر المعاينة) نطلق الواجهة مباشرة؛ أما عندما يكون
 * التطبيق في الخلفية/مغلقاً نمرر عبر إشعار عالي الأولوية مع fullScreenIntent
 * وهو الأسلوب الوحيد الموثوق والمسموح لعرض واجهة كاملة فوق القفل.
 */
public final class DuaReminderOverlayLauncher {

    public static final String CHANNEL_OVERLAY = "dua-overlay";
    public static final String EXTRA_TITLE = "extra_title";
    public static final String EXTRA_TEXT = "extra_text";
    public static final String EXTRA_BENEFIT = "extra_benefit";
    public static final String EXTRA_REFERENCE = "extra_reference";
    public static final String EXTRA_SOUND = "extra_sound";
    public static final String EXTRA_VIBRATE = "extra_vibrate";
    public static final String EXTRA_NOTE_ID = "extra_note_id";
    public static final String EXTRA_IMMEDIATE = "extra_immediate";

    private DuaReminderOverlayLauncher() {
    }

    private static void ensureChannel(Context ctx) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;
            NotificationChannel ch = nm.getNotificationChannel(CHANNEL_OVERLAY);
            if (ch == null) {
                ch = new NotificationChannel(
                        CHANNEL_OVERLAY,
                        "تذكير دعاء منتصف الشاشة",
                        NotificationManager.IMPORTANCE_HIGH);
                ch.setDescription("دعاء وأذكار تظهر فور حان الموعد");
                ch.setShowBadge(false);
                // الصوت والاهتزاز تُدار يدوياً عبر إعدادات التطبيق (لا صوت افتراضي)
                ch.setSound(null, null);
                ch.enableVibration(false);
                nm.createNotificationChannel(ch);
            }
        }
    }

    /** يعالج تشغيل الصوت والاهتزاز عند ظهور الواجهة لحظة وصول المؤقّت. */
    public static void ring(Context ctx, boolean sound, boolean vibrate) {
        if (sound) {
            try {
                Uri def = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
                Ringtone r = RingtoneManager.getRingtone(ctx, def);
                if (r != null) r.play();
            } catch (Exception ignored) {
            }
        }
        if (vibrate) {
            try {
                Vibrator v = (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null && v.hasVibrator()) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        v.vibrate(VibrationEffect.createWaveform(new long[]{0, 350, 150, 350}, -1));
                    } else {
                        v.vibrate(new long[]{0, 350, 150, 350}, -1);
                    }
                }
            } catch (Exception ignored) {
            }
        }
    }

    /** زر المعاينة: التطبيق في المقدمة فنطلق الواجهة مباشرة. */
    public static void showImmediate(Context ctx, String title, String text, String benefit,
                                     String reference, boolean sound, boolean vibrate) {
        ring(ctx, sound, vibrate);
        Intent intent = buildIntent(ctx, title, text, benefit, reference, sound, vibrate, 0, true);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        ctx.startActivity(intent);
    }

    /** من الخلفية/الإغلاق: إشعار عالي الأولوية مع fullScreenIntent. */
    public static void showViaNotification(Context ctx, String title, String text, String benefit,
                                           String reference, boolean sound, boolean vibrate) {
        ensureChannel(ctx);
        int noteId = Math.abs(title.hashCode() ^ text.hashCode()) % 1_900_000 + 1000;

        Intent intent = buildIntent(ctx, title, text, benefit, reference, sound, vibrate, noteId, false);
        PendingIntent fullScreen = PendingIntent.getActivity(
                ctx, noteId, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        PendingIntent content = PendingIntent.getActivity(
                ctx, noteId + 1, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder b = new NotificationCompat.Builder(ctx, CHANNEL_OVERLAY)
                .setSmallIcon(R.mipmap.ic_launcher_foreground)
                .setContentTitle(title)
                .setContentText(text)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(text))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setAutoCancel(true)
                .setOngoing(false)
                .setWhen(System.currentTimeMillis())
                .setShowWhen(true)
                .setDefaults(0)
                .setContentIntent(content)
                .setFullScreenIntent(fullScreen, true);

        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) {
            nm.notify(noteId, b.build());
        }
    }

    private static Intent buildIntent(Context ctx, String title, String text, String benefit,
                                      String reference, boolean sound, boolean vibrate,
                                      int noteId, boolean immediate) {
        Intent intent = new Intent(ctx, DuaReminderActivity.class);
        intent.putExtra(EXTRA_TITLE, title);
        intent.putExtra(EXTRA_TEXT, text);
        intent.putExtra(EXTRA_BENEFIT, benefit == null ? "" : benefit);
        intent.putExtra(EXTRA_REFERENCE, reference == null ? "" : reference);
        intent.putExtra(EXTRA_SOUND, sound);
        intent.putExtra(EXTRA_VIBRATE, vibrate);
        intent.putExtra(EXTRA_NOTE_ID, noteId);
        intent.putExtra(EXTRA_IMMEDIATE, immediate);
        return intent;
    }
}