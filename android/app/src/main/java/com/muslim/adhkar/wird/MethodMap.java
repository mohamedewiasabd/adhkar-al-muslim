package com.muslim.adhkar.wird;

/** خريطة أسماء طرق الحساب إلى معاملاتها (مطابقة لـ methods.ts في النسخة JavaScript). */
final class MethodMap {

    private MethodMap() {
    }

    static PrayerTimesCalc.Params build(String method) {
        PrayerTimesCalc.Params p = new PrayerTimesCalc.Params();
        if (method == null) method = "egypt";

        switch (method) {
            case "egypt":
                p.methodName = "Egyptian";
                p.fajrAngle = 19.5;
                p.ishaAngle = 17.5;
                p.adjustments[2] = 1; // dhuhr
                break;
            case "mwl":
                p.methodName = "MuslimWorldLeague";
                p.fajrAngle = 18;
                p.ishaAngle = 17;
                p.adjustments[2] = 1;
                break;
            case "makkah":
                p.methodName = "UmmAlQura";
                p.fajrAngle = 18.5;
                p.ishaAngle = 0;
                p.ishaInterval = 90;
                break;
            case "isna":
                p.methodName = "NorthAmerica";
                p.fajrAngle = 15;
                p.ishaAngle = 15;
                p.adjustments[2] = 1;
                break;
            case "karachi":
                p.methodName = "Karachi";
                p.fajrAngle = 18;
                p.ishaAngle = 18;
                p.adjustments[2] = 1;
                break;
            case "gulf":
                p.methodName = "Other";
                p.fajrAngle = 19.5;
                p.ishaAngle = 0;
                p.ishaInterval = 90;
                break;
            case "kuwait":
                p.methodName = "Kuwait";
                p.fajrAngle = 18;
                p.ishaAngle = 17.5;
                break;
            case "qatar":
                p.methodName = "Qatar";
                p.fajrAngle = 18;
                p.ishaAngle = 0;
                p.ishaInterval = 90;
                break;
            case "singapore":
                p.methodName = "Singapore";
                p.fajrAngle = 20;
                p.ishaAngle = 18;
                p.adjustments[2] = 1;
                // ملاحظة: نسخة التطبيق تُجبر التقريب على "الأقرب" لكل الطرق
                // (buildParameters في methods.ts) ⇒ نلتزم بذلك هنا أيضاً.
                p.rounding = PrayerTimesCalc.ROUND_NEAREST;
                break;
            case "france":
                p.methodName = "Other";
                p.fajrAngle = 12;
                p.ishaAngle = 12;
                p.maghribAngle = 0;
                p.ishaInterval = 0;
                break;
            case "turkey":
                p.methodName = "Turkey";
                p.fajrAngle = 18;
                p.ishaAngle = 17;
                p.adjustments[1] = -7; // sunrise
                p.adjustments[2] = 5;  // dhuhr
                p.adjustments[3] = 4;  // asr
                p.adjustments[4] = 7;  // maghrib
                break;
            case "russia":
                p.methodName = "Other";
                p.fajrAngle = 16;
                p.ishaAngle = 15;
                p.maghribAngle = 0;
                p.ishaInterval = 0;
                break;
            case "tehran":
                p.methodName = "Tehran";
                p.fajrAngle = 17.7;
                p.ishaAngle = 14;
                p.maghribAngle = 4.5;
                break;
            case "jafari":
                p.methodName = "Other";
                p.fajrAngle = 16;
                p.ishaAngle = 14;
                p.maghribAngle = 4;
                p.ishaInterval = 0;
                break;
            case "moonsighting":
                p.methodName = "MoonsightingCommittee";
                p.fajrAngle = 18;
                p.ishaAngle = 18;
                p.adjustments[2] = 5; // dhuhr
                p.adjustments[4] = 3; // maghrib
                break;
            case "dubai":
                p.methodName = "Dubai";
                p.fajrAngle = 18.2;
                p.ishaAngle = 18.2;
                p.adjustments[1] = -3; // sunrise
                p.adjustments[2] = 3;  // dhuhr
                p.adjustments[3] = 3;  // asr
                p.adjustments[4] = 3;  // maghrib
                break;
            case "custom":
            default:
                p.methodName = "Other";
                p.fajrAngle = 19.5;
                p.ishaAngle = 17.5;
                p.maghribAngle = 0;
                p.ishaInterval = 0;
                break;
        }
        return p;
    }
}
