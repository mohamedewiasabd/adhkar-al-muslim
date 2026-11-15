package com.muslim.adhkar.wird;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * يستقبل انطلاقة المؤقّتات المجدولة أصلياً، ينشر الإشعار، ثم يُعيد جدولة
 * الموعد التالي بنفس النوع — فيبقى التسلسل مستمراً إلى ما لا نهاية دون
 * الحاجة لفتح التطبيق إطلاقاً.
 */
public class NativeAlarmReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        Context ctx = context.getApplicationContext();
        String kind = intent.getStringExtra(NativeScheduler.EXTRA_KIND);
        if (kind == null) return;

        String title = intent.getStringExtra(NativeScheduler.EXTRA_TITLE);
        String body = intent.getStringExtra(NativeScheduler.EXTRA_BODY);
        String name = intent.getStringExtra(NativeScheduler.EXTRA_NAME);

        if ("rollover".equals(kind)) {
            // تجديد يومي: أعد بناء كل الجدولة وحدّث مواقيت الودجات
            NativeScheduler.rescheduleAll(ctx);
            NativeScheduler.refreshWidgets(ctx);
            return;
        }

        if (title != null) {
            String channel = NativeScheduler.CH_ADHKAR;
            if (NativeScheduler.KIND_ADHAN.equals(kind)) {
                channel = NativeScheduler.CH_ADHAN;
            } else if (NativeScheduler.KIND_REMINDER.equals(kind)
                    || NativeScheduler.KIND_OWABIN.equals(kind)
                    || NativeScheduler.KIND_TAHajjud.equals(kind)) {
                channel = NativeScheduler.CH_PRAYER;
            }
            String text = body != null ? body : "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ";
            NativeScheduler.notify(ctx, channel, title, text, NativeScheduler.notificationId(kind + "|" + name));
        }

        // أعد جدولة الموعد التالي من نفس النوع (تتابع ذاتي)
        NativeScheduler.rescheduleAll(ctx);
    }
}
