package com.muslim.adhkar.wird;

import static org.junit.Assert.*;

import org.junit.Test;

/** اختبارات منطق مدة وضع عدم الإزعاج بعد الأذان (بدون اعتماديات أندرويد). */
public class DndTimingTest {

    @Test
    public void durations_areCorrect() {
        // ساعة كاملة لكل الصلوات
        assertEquals(60 * 60 * 1000L, DndController.DURATION_MS);
        // نصف ساعة للمغرب فقط
        assertEquals(30 * 60 * 1000L, DndController.MAGHRIB_DURATION_MS);
        assertTrue(DndController.MAGHRIB_DURATION_MS < DndController.DURATION_MS);
        // الأذان الصوتي ≈ 173 ثانية ⇒ ننتظر 180 ثانية
        assertEquals(180_000L, DndController.ADHAN_DURATION_MS);
        // إعادة الوضع بعد دقيقة من تغيير المستخدم
        assertEquals(60_000L, DndController.REAPPLY_DELAY_MS);
    }

    @Test
    public void dndWindow_startsAfterAdhanEnds() {
        long adhanTime = 1_700_000_000_000L; // لحظة أذان افتراضية
        long windowStart = adhanTime + DndController.ADHAN_DURATION_MS;
        long windowEnd = windowStart + DndController.DURATION_MS;
        // الفجر: 3 دقائق بعد الأذان + ساعة
        assertEquals(180_000L + 3_600_000L, windowEnd - adhanTime);
        // المغرب: 3 دقائق بعد الأذان + نصف ساعة
        long maghribEnd = windowStart + DndController.MAGHRIB_DURATION_MS;
        assertEquals(180_000L + 1_800_000L, maghribEnd - adhanTime);
    }

    @Test
    public void eachPrayer_hasItsOwnAlarmCode() {
        assertEquals(5, DndReceiver.PRAYERS.length);
        int[] seen = new int[DndReceiver.PRAYERS.length];
        for (int i = 0; i < DndReceiver.PRAYERS.length; i++) {
            seen[i] = DndReceiver.requestCodeFor(DndReceiver.PRAYERS[i]);
            assertTrue("alarm code must be positive", seen[i] > 0);
            for (int j = 0; j < i; j++) {
                assertNotEquals("each prayer must have a distinct alarm code", seen[j], seen[i]);
            }
            // لا يجب أن يصطدم معرّف بداية أي صلاة بمعرّف النهاية أو الإعادة
            assertNotEquals("ON code must not collide with OFF", DndReceiver.RC_OFF, seen[i]);
            assertNotEquals("ON code must not collide with REAPPLY", DndReceiver.RC_REAPPLY, seen[i]);
        }
    }

    @Test
    public void untrustedFilterChange_reappliesAfterOneMinute() {
        long now = 1_700_000_000_000L;
        long reapplyAt = now + DndController.REAPPLY_DELAY_MS;
        assertEquals(60_000L, reapplyAt - now);
        // إعادة التطبيق تظل داخل النافذة
        long windowEnd = now + 30 * 60_000L;
        assertTrue(reapplyAt < windowEnd);
    }
}
