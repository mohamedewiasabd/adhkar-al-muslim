/**
 * مطبِّع نصوص عربية للبحث — يزيل التشكيل ويوحد الحروف العربية المتشابهة
 * لضمان توفيق أفضل في البحث حتى مع اختلاف الكتابة.
 */

export function normalizeArabicText(text: string): string {
  return text
    .replace(/[\u064B-\u0652\u0653-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** هل يطابق الاستعلامُ نصاً عربياً (حسابات مطابقة غير حساسة للتشكيل)؟ */
export function matchesArabic(query: string, ...fields: (string | undefined)[]): boolean {
  const q = normalizeArabicText(query);
  if (!q) return true;
  return fields.some((field) => field && normalizeArabicText(field).includes(q));
}