package com.muslim.adhkar.wird;

import java.util.Calendar;
import java.util.Locale;
import java.util.TimeZone;

/**
 * محرك حساب مواقيت الصلاة — منقول بدقّة عن مكتبة JavaScript "adhan" (v4.4.6).
 *
 * لماذا نسخة أصلية؟
 *  لأن المواقيت يجب أن تتجدّد وحدها كل يوم بدون فتح التطبيق:
 *  - تُستخدم لجدولة إشعارات الأذان والتذكير عبر AlarmManager (تعمل لأشهر).
 *  - تُستخدم لتغذية ودجد "الصلاة القادمة" فلا يبقى بياناته قديمة.
 *
 * ملاحظة: ترتيب العمليات الحسابية يتبع adhan تماماً (بما فيه تفكيك الساعات
 * العشرية إلى (ساعة، دقيقة، ثانية) والتقريب) لضمان تطابق النتيجة دقيقة بدقيقة.
 */
final class PrayerTimesCalc {

    // تقريب الدقائق
    static final int ROUND_NEAREST = 0;
    static final int ROUND_UP = 1;
    static final int ROUND_NONE = 2;

    // قواعد خطوط العرض العالية
    static final String HL_RECOMMENDED = "recommended";
    static final String HL_MIDDLE = "middle";
    static final String HL_ONE_SEVENTH = "one_seventh";
    static final String HL_ANGLE = "angle";

    /** فوق هذا العرض تُطبَّق قاعدة سُبع الليل في طريقة "رؤيت الهلال". */
    private static final double HIGH_LATITUDE_THRESHOLD = 55;

    private static final TimeZone UTC = TimeZone.getTimeZone("UTC");

    /** معاملات طريقة الحساب + الإعدادات اليدوية. */
    static final class Params {
        String methodName = "Egyptian"; // اسم الطريقة (لبعض الحالات الخاصة)
        double fajrAngle = 19.5;
        double ishaAngle = 17.5;
        double maghribAngle = 0;
        int ishaInterval = 0; // بالدقائق (0 = الزاوية)
        // تعديلات يدوية بالدقائق: الفجر، الشروق، الظهر، العصر، المغرب، العشاء
        int[] adjustments = new int[6];
        boolean hanafi = false; // مذهب العصر
        String highLat = HL_RECOMMENDED;
        int rounding = ROUND_NEAREST;
        int shafaq = 0; // 0 = عام، 1 = أحمر، 2 = أبيض (لطريقة رؤيت الهلال)
    }

    /** مواقيت يوم واحد. */
    static final class Times {
        String date = ""; // yyyy-MM-dd
        String fajr = "";
        String sunrise = "";
        String dhuhr = "";
        String asr = "";
        String maghrib = "";
        String isha = "";
        String owabin = "";
        String midnight = "";
        String lastThird = "";

        double fajrMillis = 0d;
        double sunriseMillis = 0d;
        double dhuhrMillis = 0d;
        double asrMillis = 0d;
        double maghribMillis = 0d;
        double ishaMillis = 0d;
        double lastThirdMillis = 0d;
    }

    private PrayerTimesCalc() {
    }


    /* ════════════════ حساب Core (مطابق لـ adhan) ════════════════ */

    private static double degreesToRadians(double d) {
        return d * Math.PI / 180.0;
    }

    private static double radiansToDegrees(double r) {
        return r * 180.0 / Math.PI;
    }

    private static double normalizeToScale(double num, double max) {
        return num - max * Math.floor(num / max);
    }

    private static double unwindAngle(double angle) {
        return normalizeToScale(angle, 360.0);
    }

    private static double quadrantShiftAngle(double angle) {
        if (angle >= -180 && angle <= 180) return angle;
        return angle - 360 * jsRound(angle / 360);
    }

    /** Math.round في JavaScript = floor(x + 0.5) */
    private static double jsRound(double x) {
        return Math.floor(x + 0.5);
    }

    private static double meanSolarLongitude(double t) {
        return unwindAngle(280.4664567 + 36000.76983 * t + 0.0003032 * t * t);
    }

    private static double meanLunarLongitude(double t) {
        return unwindAngle(218.3165 + 481267.8813 * t);
    }

    private static double ascendingLunarNodeLongitude(double t) {
        return unwindAngle(125.04452 - 1934.136261 * t + 0.0020708 * t * t + t * t * t / 450000);
    }

    private static double meanSolarAnomaly(double t) {
        return unwindAngle(357.52911 + 35999.05029 * t - 0.0001537 * t * t);
    }

    private static double solarEquationOfTheCenter(double t, double meanAnomaly) {
        double mrad = degreesToRadians(meanAnomaly);
        double term1 = (1.914602 - 0.004817 * t - 0.000014 * t * t) * StrictMath.sin(mrad);
        double term2 = (0.019993 - 0.000101 * t) * StrictMath.sin(2 * mrad);
        double term3 = 0.000289 * StrictMath.sin(3 * mrad);
        return term1 + term2 + term3;
    }

    private static double apparentSolarLongitude(double t, double meanLongitude) {
        double longitude = meanLongitude + solarEquationOfTheCenter(t, meanSolarAnomaly(t));
        double omega = 125.04 - 1934.136 * t;
        double lambda = longitude - 0.00569 - 0.00478 * StrictMath.sin(degreesToRadians(omega));
        return unwindAngle(lambda);
    }

    private static double meanObliquityOfTheEcliptic(double t) {
        // adhan: term1 - term2 - term3 + term4
        return 23.439291 - 0.013004167 * t - 0.0000001639 * t * t + 0.0000005036 * t * t * t;
    }

    private static double apparentObliquityOfTheEcliptic(double t, double meanObliquity) {
        double o = 125.04 - 1934.136 * t;
        return meanObliquity + 0.00256 * StrictMath.cos(degreesToRadians(o));
    }

    private static double meanSiderealTime(double t) {
        double jd = t * 36525 + 2451545.0;
        return unwindAngle(280.46061837 + 360.98564736629 * (jd - 2451545)
                + 0.000387933 * t * t - (t * t * t) / 38710000);
    }

    private static double nutationInLongitude(double t, double solarLongitude, double lunarLongitude,
            double ascendingNode) {
        // adhan: term1 - term2 - term3 + term4  (term4 uses 2 * Omega)
        return -17.2 / 3600 * StrictMath.sin(degreesToRadians(ascendingNode))
                - 1.32 / 3600 * StrictMath.sin(2 * degreesToRadians(solarLongitude))
                - 0.23 / 3600 * StrictMath.sin(2 * degreesToRadians(lunarLongitude))
                + 0.21 / 3600 * StrictMath.sin(2 * degreesToRadians(ascendingNode));
    }

    private static double nutationInObliquity(double t, double solarLongitude, double lunarLongitude,
            double ascendingNode) {
        // adhan: term1 + term2 + term3 - term4  (term4 uses 2 * Omega)
        return 9.2 / 3600 * StrictMath.cos(degreesToRadians(ascendingNode))
                + 0.57 / 3600 * StrictMath.cos(2 * degreesToRadians(solarLongitude))
                + 0.1 / 3600 * StrictMath.cos(2 * degreesToRadians(lunarLongitude))
                - 0.09 / 3600 * StrictMath.cos(2 * degreesToRadians(ascendingNode));
    }

    private static double altitudeOfCelestialBody(double latitude, double declination, double hourAngle) {
        double term1 = StrictMath.sin(degreesToRadians(latitude)) * StrictMath.sin(degreesToRadians(declination));
        double term2 = StrictMath.cos(degreesToRadians(latitude)) * StrictMath.cos(degreesToRadians(declination))
                * StrictMath.cos(degreesToRadians(hourAngle));
        return radiansToDegrees(StrictMath.asin(term1 + term2));
    }

    private static double approximateTransit(double longitude, double siderealTime, double rightAscension) {
        double lw = longitude * -1;
        double m0 = normalizeToScale((rightAscension + lw - siderealTime) / 360, 1);
        double expected = normalizeToScale((12.0 - longitude / 15.0) / 24.0, 1);
        if (m0 - expected > 0.5) return m0 - 1.0;
        if (expected - m0 > 0.5) return m0 + 1.0;
        return m0;
    }

    private static double correctedTransit(double approxTransit, double longitude, double siderealTime,
            double rightAscension, double prevRightAscension, double nextRightAscension) {
        double m0 = approxTransit;
        double lw = longitude * -1;
        double theta = unwindAngle(siderealTime + 360.985647 * m0);
        double a = unwindAngle(interpolateAngles(rightAscension, prevRightAscension, nextRightAscension, m0));
        double h = quadrantShiftAngle(theta - lw - a);
        double dm = h / -360;
        return (m0 + dm) * 24;
    }

    private static double correctedHourAngle(double approxTransit, double angle, double latitude,
            double longitude, boolean afterTransit, double siderealTime, double rightAscension,
            double prevRightAscension, double nextRightAscension, double declination, double prevDeclination,
            double nextDeclination) {
        double m0 = approxTransit;
        double lw = longitude * -1;
        double term1 = StrictMath.sin(degreesToRadians(angle))
                - StrictMath.sin(degreesToRadians(latitude)) * StrictMath.sin(degreesToRadians(declination));
        double term2 = StrictMath.cos(degreesToRadians(latitude)) * StrictMath.cos(degreesToRadians(declination));
        double h0 = radiansToDegrees(StrictMath.acos(term1 / term2));
        double m = afterTransit ? m0 + h0 / 360 : m0 - h0 / 360;
        double theta = unwindAngle(siderealTime + 360.985647 * m);
        double a = unwindAngle(interpolateAngles(rightAscension, prevRightAscension, nextRightAscension, m));
        double delta = interpolate(declination, prevDeclination, nextDeclination, m);
        double h = theta - lw - a;
        double altitude = altitudeOfCelestialBody(latitude, delta, h);
        double term3 = altitude - angle;
        double term4 = 360 * StrictMath.cos(degreesToRadians(delta)) * StrictMath.cos(degreesToRadians(latitude))
                * StrictMath.sin(degreesToRadians(h));
        double dm = term3 / term4;
        return (m + dm) * 24;
    }

    private static double interpolate(double y2, double y1, double y3, double n) {
        double a = y2 - y1;
        double b = y3 - y2;
        double c = b - a;
        return y2 + n / 2 * (a + b + n * c);
    }

    private static double interpolateAngles(double y2, double y1, double y3, double n) {
        double a = unwindAngle(y2 - y1);
        double b = unwindAngle(y3 - y2);
        double c = b - a;
        return y2 + n / 2 * (a + b + n * c);
    }

    /** Math.trunc في JavaScript (قطع نحو الصفر) — بديل محمول. */
    private static int truncToInt(double x) {
        return (int) (x < 0 ? Math.ceil(x) : Math.floor(x));
    }

    private static double julianDay(int year, int month, int day, double hours) {
        int y = month > 2 ? year : year - 1;
        int m = month > 2 ? month : month + 12;
        double d = day + hours / 24;
        int a = truncToInt(y / 100.0);
        int b = truncToInt(2 - a + truncToInt(a / 4.0));
        int i0 = truncToInt(365.25 * (y + 4716));
        int i1 = truncToInt(30.6001 * (m + 1));
        return i0 + i1 + d + b - 1524.5;
    }

    private static double julianCentury(double jd) {
        return (jd - 2451545.0) / 36525;
    }

    private static boolean isLeapYear(int year) {
        if (year % 4 != 0) return false;
        return year % 100 != 0 || year % 400 == 0;
    }

    private static int dayOfYear(int year, int month, int day) {
        int feb = isLeapYear(year) ? 29 : 28;
        int[] months = { 31, feb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 };
        int total = 0;
        for (int i = 0; i < month - 1; i++) total += months[i];
        return total + day;
    }

    private static int daysSinceSolstice(int dayOfYear, int year, double latitude) {
        int northernOffset = 10;
        int southernOffset = isLeapYear(year) ? 173 : 172;
        int daysInYear = isLeapYear(year) ? 366 : 365;
        if (latitude >= 0) {
            int d = dayOfYear + northernOffset;
            if (d >= daysInYear) d -= daysInYear;
            return d;
        }
        int d = dayOfYear - southernOffset;
        if (d < 0) d += daysInYear;
        return d;
    }

    /**
     * مقدار التعديل الموسمي للشفق (بالدقائق) — يُستخدم في طريقة "رؤيت الهلال" فقط.
     *
     * @param shafaq 0 = عام، 1 = أحمر (Ahmer)، 2 = أبيض (Abyad)
     * @param morning true للفق الصباحي، false للمسائي
     */
    private static double seasonAdjustment(double latitude, int dayOfYear, int year, int shafaq,
            boolean morning) {
        double a;
        double b;
        double c;
        double d;
        if (morning) {
            a = 75 + 28.65 / 55.0 * StrictMath.abs(latitude);
            b = 75 + 19.44 / 55.0 * StrictMath.abs(latitude);
            c = 75 + 32.74 / 55.0 * StrictMath.abs(latitude);
            d = 75 + 48.1 / 55.0 * StrictMath.abs(latitude);
        } else if (shafaq == 1) { // Ahmer
            a = 62 + 17.4 / 55.0 * StrictMath.abs(latitude);
            b = 62 - 7.16 / 55.0 * StrictMath.abs(latitude);
            c = 62 + 5.12 / 55.0 * StrictMath.abs(latitude);
            d = 62 + 19.44 / 55.0 * StrictMath.abs(latitude);
        } else if (shafaq == 2) { // Abyad
            a = 75 + 25.6 / 55.0 * StrictMath.abs(latitude);
            b = 75 + 7.16 / 55.0 * StrictMath.abs(latitude);
            c = 75 + 36.84 / 55.0 * StrictMath.abs(latitude);
            d = 75 + 81.84 / 55.0 * StrictMath.abs(latitude);
        } else { // General
            a = 75 + 25.6 / 55.0 * StrictMath.abs(latitude);
            b = 75 + 2.05 / 55.0 * StrictMath.abs(latitude);
            c = 75 - 9.21 / 55.0 * StrictMath.abs(latitude);
            d = 75 + 6.14 / 55.0 * StrictMath.abs(latitude);
        }
        double dyy = daysSinceSolstice(dayOfYear, year, latitude);
        if (dyy < 91) {
            return a + (b - a) / 91.0 * dyy;
        }
        if (dyy < 137) {
            return b + (c - b) / 46.0 * (dyy - 91);
        }
        if (dyy < 183) {
            return c + (d - c) / 46.0 * (dyy - 137);
        }
        if (dyy < 229) {
            return d + (c - d) / 46.0 * (dyy - 183);
        }
        if (dyy < 275) {
            return c + (b - c) / 46.0 * (dyy - 229);
        }
        return b + (a - b) / 91.0 * (dyy - 275);
    }

    /** الشفق الصباحي الموسمي (طريقة رؤيت الهلال) — بالمِلّي ثانية. */
    private static double seasonAdjustedMorningTwilightMillis(double latitude, int dayOfYear, int year,
            double sunriseMillis) {
        return addSeconds(sunriseMillis,
                StrictMath.round(seasonAdjustment(latitude, dayOfYear, year, 0, true) * -60.0));
    }

    /** الشفق المسائي الموسمي (طريقة رؤيت الهلال) — بالمِلّي ثانية. */
    private static double seasonAdjustedEveningTwilightMillis(double latitude, int dayOfYear, int year,
            double sunsetMillis, int shafaq) {
        return addSeconds(sunsetMillis,
                StrictMath.round(seasonAdjustment(latitude, dayOfYear, year, shafaq, false) * 60.0));
    }

    /** إحداثيات الشمس للحظة يوليد جولياني معيّن. */
    private static final class Solar {
        double declination;
        double rightAscension;
        double apparentSiderealTime;

        Solar(double jd) {
            double t = julianCentury(jd);
            double l0 = meanSolarLongitude(t);
            double lp = meanLunarLongitude(t);
            double omega = ascendingLunarNodeLongitude(t);
            double lambda = degreesToRadians(apparentSolarLongitude(t, l0));
            double theta0 = meanSiderealTime(t);
            double dPsi = nutationInLongitude(t, l0, lp, omega);
            double dEpsilon = nutationInObliquity(t, l0, lp, omega);
            double epsilon0 = meanObliquityOfTheEcliptic(t);
            double epsilonApparent = degreesToRadians(apparentObliquityOfTheEcliptic(t, epsilon0));

            declination = radiansToDegrees(StrictMath.asin(StrictMath.sin(epsilonApparent) * StrictMath.sin(lambda)));
            rightAscension = unwindAngle(
                    radiansToDegrees(StrictMath.atan2(StrictMath.cos(epsilonApparent) * StrictMath.sin(lambda), StrictMath.cos(lambda))));
            apparentSiderealTime = theta0 + dPsi * 3600 * StrictMath.cos(degreesToRadians(epsilon0 + dEpsilon)) / 3600;
        }
    }

    /** أوقات الشمس (بالساعات منذ منتصف ليل UTC). */
    static final class SolarTime {
        double observerLat;
        double observerLng;
        Solar solar;
        Solar prevSolar;
        Solar nextSolar;
        double approxTransit;
        double transit;
        double sunrise;
        double sunset;

        SolarTime(int year, int month, int day, double latitude, double longitude) {
            double jd = julianDay(year, month, day, 0);
            observerLat = latitude;
            observerLng = longitude;
            solar = new Solar(jd);
            prevSolar = new Solar(jd - 1);
            nextSolar = new Solar(jd + 1);
            double m0 = approximateTransit(longitude, solar.apparentSiderealTime, solar.rightAscension);
            double solarAltitude = -50.0 / 60.0;
            approxTransit = m0;
            transit = correctedTransit(m0, longitude, solar.apparentSiderealTime, solar.rightAscension,
                    prevSolar.rightAscension, nextSolar.rightAscension);
            sunrise = correctedHourAngle(m0, solarAltitude, latitude, longitude, false, solar.apparentSiderealTime,
                    solar.rightAscension, prevSolar.rightAscension, nextSolar.rightAscension, solar.declination,
                    prevSolar.declination, nextSolar.declination);
            sunset = correctedHourAngle(m0, solarAltitude, latitude, longitude, true, solar.apparentSiderealTime,
                    solar.rightAscension, prevSolar.rightAscension, nextSolar.rightAscension, solar.declination,
                    prevSolar.declination, nextSolar.declination);
        }

        double hourAngle(double angle, boolean afterTransit) {
            return correctedHourAngle(approxTransit, angle, observerLat, observerLng, afterTransit,
                    solar.apparentSiderealTime, solar.rightAscension, prevSolar.rightAscension, nextSolar.rightAscension,
                    solar.declination, prevSolar.declination, nextSolar.declination);
        }

        double afternoon(double shadowLength) {
            double tangent = Math.abs(observerLat - solar.declination);
            double inverse = shadowLength + StrictMath.tan(degreesToRadians(tangent));
            double angle = radiansToDegrees(StrictMath.atan(1.0 / inverse));
            return hourAngle(angle, true);
        }
    }

    /* ════════════════ أدوات التاريخ ════════════════ */

    /**
     * TimeComponents في adhan: يفكّ الساعات العشرية إلى (ساعة، دقيقة، ثانية) بتقريب لأسفل.
     * adhan يحوّلها بعد ذلك إلى تاريخ بتوقيت UTC على نفس اليوم الميلادي.
     */
    private static double componentsToUtcMillis(int year, int month, int day, double num) {
        if (Double.isNaN(num)) return Double.NaN;
        double hours = Math.floor(num);
        double minutes = Math.floor((num - hours) * 60);
        double seconds = Math.floor((num - (hours + minutes / 60)) * 60 * 60);
        Calendar c = Calendar.getInstance(UTC);
        c.clear();
        c.set(year, month - 1, day, (int) hours, (int) minutes, (int) seconds);
        return c.getTimeInMillis();
    }

    /** dateByAddingSeconds في adhan (يكسر المِلّي ثانية إلى عدد صحيح). */
    private static double addSeconds(double millis, double seconds) {
        return millis + seconds * 1000.0;
    }

    /** تقريب إلى أقرب دقيقة (كما في adhan.roundedMinute). */
    private static double roundMinute(double millis, int rounding) {
        if (Double.isNaN(millis)) return Double.NaN;
        Calendar c = Calendar.getInstance(UTC);
        c.setTimeInMillis((long) millis);
        int seconds = c.get(Calendar.SECOND);
        int offset;
        if (rounding == ROUND_UP) {
            offset = 60 - seconds;
        } else if (rounding == ROUND_NONE) {
            offset = 0;
        } else {
            offset = seconds >= 30 ? 60 - seconds : -seconds;
        }
        return millis + offset * 1000.0;
    }

    /** يضيف عدداً من الأيام على تاريخ ميلادي. */
    private static int[] addDays(int year, int month, int day, int days) {
        Calendar c = Calendar.getInstance(UTC);
        c.clear();
        c.set(year, month - 1, day, 12, 0, 0);
        c.add(Calendar.DAY_OF_MONTH, days);
        return new int[] { c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH) };
    }

    /* ════════════════ الواجهة العامة ════════════════ */

    /** مواقيت خام (بلا تعديل/تقريب) تخدم حساب اليوم وت.Length من الليل. */
    private static final class Raw {
        double fajr;
        double sunrise;
        double dhuhr;
        double asr;
        double maghrib;
        double isha;
    }

    /**
     * يحسب المواقيت الخام ليوم محدّد (نفس منطق adhan's PrayerTimes).
     * لا يحسب ثلث الليل (يحتاج مواقيت الغد) لتفادي التكرار.
     */
    private static Raw computeRaw(int year, int month, int day, double latitude, double longitude,
            Params params) {
        SolarTime solarTime = new SolarTime(year, month, day, latitude, longitude);

        // منتصف اليوم (الظهر)
        double dhuhrRaw = componentsToUtcMillis(year, month, day, solarTime.transit);

        // اليوم التالي (لحساب طول الليل) — تاريخ ميلادي + يوم
        int[] y1 = addDays(year, month, day, 1);
        SolarTime tomorrowSolarTime = new SolarTime(y1[0], y1[1], y1[2], latitude, longitude);

        // العصر
        double shadowLength = params.hanafi ? 2 : 1;
        double asrRaw = componentsToUtcMillis(year, month, day, solarTime.afternoon(shadowLength));

        double sunriseRaw = componentsToUtcMillis(year, month, day, solarTime.sunrise);
        double sunsetRaw = componentsToUtcMillis(year, month, day, solarTime.sunset);
        double tomorrowSunriseRaw = componentsToUtcMillis(y1[0], y1[1], y1[2], tomorrowSolarTime.sunrise);

        // طول الليل بالثواني: (شروق الغد - الغروب اليوم)
        double nightSeconds = (tomorrowSunriseRaw - sunsetRaw) / 1000.0;

        Portions portions = nightPortions(params, latitude);

        boolean moonsighting = "MoonsightingCommittee".equals(params.methodName);
        boolean highLatMoonsighting = moonsighting && latitude >= HIGH_LATITUDE_THRESHOLD;

        // ── الفجر ──
        double fajrRaw = componentsToUtcMillis(year, month, day, solarTime.hourAngle(-1 * params.fajrAngle, false));
        // حالة خاصة برؤيت الهلال فوق عرض 55°: الفجر = سُبع الليل قبل الشروق
        if (highLatMoonsighting) {
            fajrRaw = addSeconds(sunriseRaw, -nightSeconds / 7);
        }
        double safeFajr;
        if (moonsighting) {
            safeFajr = seasonAdjustedMorningTwilightMillis(latitude, dayOfYear(year, month, day), year, sunriseRaw);
        } else {
            safeFajr = addSeconds(sunriseRaw, -portions.fajr * nightSeconds);
        }
        if (Double.isNaN(fajrRaw) || safeFajr > fajrRaw) fajrRaw = safeFajr;

        // ── العشاء ──
        double ishaRaw;
        if (params.ishaInterval > 0) {
            ishaRaw = sunsetRaw + params.ishaInterval * 60000L;
        } else {
            ishaRaw = componentsToUtcMillis(year, month, day, solarTime.hourAngle(-1 * params.ishaAngle, true));
            if (highLatMoonsighting) {
                ishaRaw = addSeconds(sunsetRaw, nightSeconds / 7);
            }
            double safeIsha;
            if (moonsighting) {
                safeIsha = seasonAdjustedEveningTwilightMillis(latitude, dayOfYear(year, month, day), year,
                        sunsetRaw, params.shafaq);
            } else {
                safeIsha = addSeconds(sunsetRaw, portions.isha * nightSeconds);
            }
            if (Double.isNaN(ishaRaw) || safeIsha < ishaRaw) ishaRaw = safeIsha;
        }

        // ── المغرب ──
        double maghribRaw = sunsetRaw;
        if (params.maghribAngle != 0) {
            double angleBasedMaghrib = componentsToUtcMillis(year, month, day,
                    solarTime.hourAngle(-1 * params.maghribAngle, true));
            if (sunsetRaw < angleBasedMaghrib && ishaRaw > angleBasedMaghrib) {
                maghribRaw = angleBasedMaghrib;
            }
        }

        Raw raw = new Raw();
        raw.fajr = fajrRaw;
        raw.sunrise = sunriseRaw;
        raw.dhuhr = dhuhrRaw;
        raw.asr = asrRaw;
        raw.maghrib = maghribRaw;
        raw.isha = ishaRaw;
        return raw;
    }

    /**
     * يحسب مواقيت يوم محدّد.
     *
     * @param year سنة اليوم (بالتقويم الميلادي، حسب المنطقة الزمنية للموقع)
     * @param month الشهر (1..12)
     * @param day اليوم (1..31)
     * @param params معاملات طريقة الحساب
     * @param tz المنطقة الزمنية للموقع
     */
    static Times compute(int year, int month, int day, double latitude, double longitude, Params params, TimeZone tz) {
        Times out = new Times();
        out.date = String.format(Locale.US, "%04d-%02d-%02d", year, month, day);

        Raw raw = computeRaw(year, month, day, latitude, longitude, params);

        // ── التعديلات اليدوية + التقريب ──
        double fajr = roundMinute(raw.fajr + params.adjustments[0] * 60000.0, params.rounding);
        double sunrise = roundMinute(raw.sunrise + params.adjustments[1] * 60000.0, params.rounding);
        double dhuhr = roundMinute(raw.dhuhr + params.adjustments[2] * 60000.0, params.rounding);
        double asr = roundMinute(raw.asr + params.adjustments[3] * 60000.0, params.rounding);
        double maghrib = roundMinute(raw.maghrib + params.adjustments[4] * 60000.0, params.rounding);
        double isha = roundMinute(raw.isha + params.adjustments[5] * 60000.0, params.rounding);

        out.fajrMillis = fajr;
        out.sunriseMillis = sunrise;
        out.dhuhrMillis = dhuhr;
        out.asrMillis = asr;
        out.maghribMillis = maghrib;
        out.ishaMillis = isha;

        // ── ثلث الليل ووسطه ──
        // يحتاج فجر الغد النهائي (بالتعديل والتقريب) ⇒ نحسب الخام للغد.
        int[] y1 = addDays(year, month, day, 1);
        Raw rawNext = computeRaw(y1[0], y1[1], y1[2], latitude, longitude, params);
        double nextFajr = roundMinute(rawNext.fajr + params.adjustments[0] * 60000.0, params.rounding);
        double nightOfToday = (nextFajr - maghrib) / 1000.0;
        double midnightUtc = roundMinute(addSeconds(maghrib, nightOfToday / 2), ROUND_NEAREST);
        double lastThirdUtc = roundMinute(addSeconds(maghrib, nightOfToday * (2.0 / 3.0)), ROUND_NEAREST);
        out.lastThirdMillis = lastThirdUtc;

        // إلى الساعة الجدارية للمنطقة الزمنية
        out.fajr = wallHM(fajr, tz);
        out.sunrise = wallHM(sunrise, tz);
        out.dhuhr = wallHM(dhuhr, tz);
        out.asr = wallHM(asr, tz);
        out.maghrib = wallHM(maghrib, tz);
        out.isha = wallHM(isha, tz);
        out.midnight = wallHM(midnightUtc, tz);
        out.lastThird = wallHM(lastThirdUtc, tz);
        // صلاة الأوابين = الظهر - 60 دقيقة
        out.owabin = shiftHM(out.dhuhr, -60);

        return out;
    }

    private static final class Portions {
        final double fajr;
        final double isha;

        Portions(double fajr, double isha) {
            this.fajr = fajr;
            this.isha = isha;
        }
    }

    private static Portions nightPortions(Params params, double latitude) {
        String rule = params.highLat;
        if (HL_RECOMMENDED.equals(rule)) {
            rule = latitude > 48 ? HL_ONE_SEVENTH : HL_MIDDLE;
        }
        switch (rule) {
            case HL_MIDDLE:
                return new Portions(1.0 / 2, 1.0 / 2);
            case HL_ONE_SEVENTH:
                return new Portions(1.0 / 7, 1.0 / 7);
            case HL_ANGLE:
                return new Portions(params.fajrAngle / 60.0, params.ishaAngle / 60.0);
            default:
                return new Portions(1.0 / 2, 1.0 / 2);
        }
    }

    /** يحوّل لحظة مطلقة إلى "HH:MM" حسب ساعة المنطقة الزمنية. */
    static String wallHM(double millis, TimeZone tz) {
        if (Double.isNaN(millis) || Double.isInfinite(millis)) return "--:--";
        Calendar c = Calendar.getInstance(tz);
        c.setTimeInMillis((long) millis);
        return String.format(Locale.US, "%02d:%02d", c.get(Calendar.HOUR_OF_DAY), c.get(Calendar.MINUTE));
    }

    /** يزيح "HH:MM" بعدد من الدقائق (مع الالتفاف عند منتصف الليل). */
    static String shiftHM(String hhmm, int deltaMinutes) {
        try {
            String[] parts = hhmm.split(":");
            int h = Integer.parseInt(parts[0]);
            int m = Integer.parseInt(parts[1]);
            int total = (h * 60 + m + deltaMinutes) % 1440;
            if (total < 0) total += 1440;
            return String.format(Locale.US, "%02d:%02d", total / 60, total % 60);
        } catch (Exception e) {
            return hhmm;
        }
    }

    /**
     * اللحظة المطلقة التي تكون فيها الساعة الجدارية "HH:MM" في التاريخ المعطى بالمنطقة الزمنية.
     * (مطابق لـ zonedDateTimeUtc في النسخة JavaScript)
     */
    static long zonedToUtcMillis(int year, int month, int day, String hhmm, TimeZone tz) {
        int h = 0;
        int m = 0;
        try {
            String[] parts = hhmm.split(":");
            h = Integer.parseInt(parts[0]);
            m = Integer.parseInt(parts[1]);
        } catch (Exception ignored) {
        }
        // نفس منطق النسخة JavaScript: جرّب نافذة ±14 ساعة حول التوقيت المرجعي
        Calendar base = Calendar.getInstance(tz);
        base.clear();
        base.set(year, month - 1, day, h, m, 0);
        base.set(Calendar.MILLISECOND, 0);
        long seed = base.getTimeInMillis();
        for (int k = -28; k <= 28; k++) {
            Calendar cand = Calendar.getInstance(tz);
            cand.setTimeInMillis(seed + k * 30 * 60 * 1000L);
            if (cand.get(Calendar.YEAR) == year && cand.get(Calendar.MONTH) + 1 == month
                    && cand.get(Calendar.DAY_OF_MONTH) == day && cand.get(Calendar.HOUR_OF_DAY) == h
                    && cand.get(Calendar.MINUTE) == m) {
                return cand.getTimeInMillis();
            }
        }
        return seed;
    }

    /** التاريخ (سنة/شهر/يوم) حسب ساعة المنطقة الزمنية للحظة معيّنة. */
    static int[] wallDate(long millis, TimeZone tz) {
        Calendar c = Calendar.getInstance(tz);
        c.setTimeInMillis(millis);
        return new int[] { c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH) };
    }
}
