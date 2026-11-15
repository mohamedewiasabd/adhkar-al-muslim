package com.muslim.adhkar.wird;

import java.util.Calendar;
import java.util.TimeZone;

/**
 * اختبار منطقي شامل (JVM) — لا يحتاج أندرويد:
 * يتحقّق من صحّة مواقيت الصلاة، ومنطقية "الموعد القادم"،
 * ومن Continua次の끼の.algo
 */
public final class SchedulerLogicTest {

    private static int passed = 0;
    private static int failed = 0;

    @org.junit.Test
    public void schedulerLogic_isCorrect() {
        // ── 1) المواقيت الأساسية تطابق adhan تماماً ──
        PrayerTimesCalc.Params p = MethodMap.build("egypt");
        PrayerTimesCalc.Times c = PrayerTimesCalc.compute(2026, 9, 25, 30.0444, 31.2357, p,
                TimeZone.getTimeZone("Africa/Cairo"));
        check("cairo fajr", "05:18", c.fajr);
        check("cairo sunrise", "06:45", c.sunrise);
        check("cairo dhuhr", "12:48", c.dhuhr);
        check("cairo asr", "16:12", c.asr);
        check("cairo maghrib", "18:48", c.maghrib);
        check("cairo isha", "20:05", c.isha);
        check("cairo owabin", "11:48", c.owabin);

        // ── 2) طريقة مكة (فاصل 90 دقيقة للعشاء) ──
        PrayerTimesCalc.Times m = PrayerTimesCalc.compute(2026, 9, 25, 21.4225, 39.8262,
                MethodMap.build("makkah"), TimeZone.getTimeZone("Asia/Riyadh"));
        check("makkah fajr", "04:54", m.fajr);
        check("makkah isha (maghrib+90)", "19:44", m.isha);

        // ── 3) مذهب الحنفي ──
        PrayerTimesCalc.Params hanafi = MethodMap.build("egypt");
        hanafi.hanafi = true;
        PrayerTimesCalc.Times h = PrayerTimesCalc.compute(2026, 9, 25, 30.0444, 31.2357, hanafi,
                TimeZone.getTimeZone("Africa/Cairo"));
        check("hanafi asr later", true, h.asr.compareTo(c.asr) > 0);

        // ── 4) موقع ≠ جهاز: الموعد القادم يُحسب بتوقيت الموقع ──
        TimeZone riyadh = TimeZone.getTimeZone("Asia/Riyadh");
        long now = timeAt(2026, 9, 25, 10, 0, riyadh);
        // الساعة 10:00 ⇒ فجر اليوم مضى ⇒ الموعد القادم هو فجر الغد
        String wall = nextWall(p, 24.7136, 46.6753, riyadh, "fajr", now);
        check("riyadh next fajr wall (tomorrow)", "04:21", wall);
        long instant = PrayerTimesCalc.zonedToUtcMillis(2026, 9, 26, wall, riyadh);
        check("riyadh fajr instant > now", true, instant > now);

        // ── 5) بعد الموعد ⇒ الموعد التالي غداً ──
        long after = timeAt(2026, 9, 25, 12, 0, riyadh);
        String wall2 = nextWall(p, 24.7136, 46.6753, riyadh, "fajr", after);
        check("riyadh next fajr (tomorrow)", "04:21", wall2);
        long instant2 = PrayerTimesCalc.zonedToUtcMillis(2026, 9, 26, wall2, riyadh);
        check("tomorrow instant > now", true, instant2 > after);

        // ── 6) أذكار الصباح: تتكرّر يومياً ──
        long b1 = NativeScheduler.nextTimeOfDay("06:30", timeAt(2026, 9, 25, 3, 0, TimeZone.getDefault()));
        long b2 = NativeScheduler.nextTimeOfDay("06:30", timeAt(2026, 9, 25, 7, 0, TimeZone.getDefault()));
        check("morning 06:30", "06:30", NativeScheduler.hm(b1));
        check("morning tomorrow 06:30", "06:30", NativeScheduler.hm(b2));
        check("morning tomorrow date", 26, dayOf(b2));

        // ── 7) الدوري: يتخطّى مواعيد الصباح والمساء ──
        long p1 = NativeScheduler.nextPeriodic(timeAt(2026, 9, 25, 6, 0, TimeZone.getDefault()), 30, "06:30", "17:30");
        check("periodic skips 06:30", "06:45", NativeScheduler.hm(p1));
        long p2 = NativeScheduler.nextPeriodic(timeAt(2026, 9, 25, 17, 30, TimeZone.getDefault()), 30, "06:30", "17:30");
        // شبكة 30 دقيقة تبدأ من 06:45 ⇒ لا تقع على 17:30 ⇒ التالي 17:45
        check("periodic after 17:30 -> 17:45", "17:45", NativeScheduler.hm(p2));
        check("periodic same day", 25, dayOf(p2));

        // ── 8) نطاق ساعات الاستيقاظ ──
        long p3 = NativeScheduler.nextPeriodic(timeAt(2026, 9, 25, 21, 20, TimeZone.getDefault()), 30, "06:30", "17:30");
        check("periodic after 21:15 -> next day", 26, dayOf(p3));
        check("periodic next day 06:45", "06:45", NativeScheduler.hm(p3));

        // ── 9) ذهاب وإياب تحويل الموعد الجداري إلى لحظة مطلقة ──
        TimeZone[] zones = {
            TimeZone.getTimeZone("Africa/Cairo"), TimeZone.getTimeZone("Asia/Riyadh"),
            TimeZone.getTimeZone("Asia/Tokyo"), TimeZone.getTimeZone("America/New_York"),
            TimeZone.getTimeZone("Europe/London"), TimeZone.getTimeZone("Asia/Kolkata"),
        };
        int roundTripBad = 0;
        int roundTripTotal = 0;
        for (TimeZone zone : zones) {
            for (int mo = 1; mo <= 12; mo += 3) {
                for (int dd = 1; dd <= 28; dd += 9) {
                    PrayerTimesCalc.Times rt = PrayerTimesCalc.compute(2026, mo, dd, 30.0, 31.2, p, zone);
                    String[] walls = { rt.fajr, rt.sunrise, rt.dhuhr, rt.asr, rt.maghrib, rt.isha };
                    for (String w : walls) {
                        if (w == null || w.contains("--")) continue;
                        roundTripTotal++;
                        long inst = PrayerTimesCalc.zonedToUtcMillis(2026, mo, dd, w, zone);
                        if (!w.equals(PrayerTimesCalc.wallHM(inst, zone))) roundTripBad++;
                    }
                }
            }
        }
        check("wall->instant round-trip (" + roundTripTotal + " cases)", 0, roundTripBad);

        System.out.println("=== " + passed + " passed, " + failed + " failed ===");
        if (failed > 0) throw new AssertionError(failed + " check(s) failed");
    }

    /** يحاكي nextWallTime في المجدول الأصلي. */
    private static String nextWall(PrayerTimesCalc.Params params, double lat, double lng, TimeZone tz,
            String name, long now) {
        for (int offset = 0; offset <= 1; offset++) {
            Calendar c = Calendar.getInstance(tz);
            c.clear();
            c.setTimeInMillis(now);
            c.set(Calendar.HOUR_OF_DAY, 12);
            c.set(Calendar.MINUTE, 0);
            c.set(Calendar.SECOND, 0);
            c.add(Calendar.DAY_OF_MONTH, offset);
            PrayerTimesCalc.Times t = PrayerTimesCalc.compute(c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1,
                    c.get(Calendar.DAY_OF_MONTH), lat, lng, params, tz);
            String wall = "fajr".equals(name) ? t.fajr : "isha".equals(name) ? t.isha : t.dhuhr;
            if (wall == null || wall.contains("--")) continue;
            long instant = PrayerTimesCalc.zonedToUtcMillis(c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1,
                    c.get(Calendar.DAY_OF_MONTH), wall, tz);
            if (instant > now) return wall;
        }
        return null;
    }

    private static long timeAt(int y, int mo, int d, int h, int mi, TimeZone tz) {
        Calendar c = Calendar.getInstance(tz);
        c.clear();
        c.set(y, mo - 1, d, h, mi, 0);
        return c.getTimeInMillis();
    }

    private static int dayOf(long millis) {
        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(millis);
        return c.get(Calendar.DAY_OF_MONTH);
    }

    private static void check(String name, String expected, String actual) {
        if (expected.equals(actual)) {
            passed++;
            System.out.println("  ok  " + name + " = " + actual);
        } else {
            failed++;
            System.out.println("  FAIL " + name + ": expected " + expected + " got " + actual);
        }
    }

    private static void check(String name, int expected, int actual) {
        if (expected == actual) {
            passed++;
            System.out.println("  ok  " + name + " = " + actual);
        } else {
            failed++;
            System.out.println("  FAIL " + name + ": expected " + expected + " got " + actual);
        }
    }

    private static void check(String name, boolean expected, boolean actual) {
        if (expected == actual) {
            passed++;
            System.out.println("  ok  " + name);
        } else {
            failed++;
            System.out.println("  FAIL " + name);
        }
    }
}
