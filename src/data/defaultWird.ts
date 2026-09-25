import { Achievement, DailyWirdItem } from '../types';

export const initialWirdItems: DailyWirdItem[] = [
  {
    id: 'w-morning',
    title: 'أذكار الصباح كاملة',
    description: 'تحصين الصباح وبداية اليوم بذكر الله',
    target: 1,
    current: 0,
    unit: 'مرة',
    completed: false,
    category: 'adhkar'
  },
  {
    id: 'w-evening',
    title: 'أذكار المساء كاملة',
    description: 'حفظ الليل والاستعاذة من الشرور',
    target: 1,
    current: 0,
    unit: 'مرة',
    completed: false,
    category: 'adhkar'
  },
  {
    id: 'w-quran',
    title: 'الورد القرآني اليومي',
    description: 'قراءة حزب أو 4 صفحات بتدبر',
    target: 4,
    current: 0,
    unit: 'صفحات',
    completed: false,
    category: 'quran'
  },
  {
    id: 'w-istighfar',
    title: 'الاستغفار والتوبة',
    description: 'أستغفر الله وأتوب إليه',
    target: 100,
    current: 0,
    unit: 'تسبيحة',
    completed: false,
    category: 'tasbeeh'
  },
  {
    id: 'w-salawat',
    title: 'الصلاة والسلام على النبي ﷺ',
    description: 'اللهم صل وسلم على نبينا محمد',
    target: 100,
    current: 0,
    unit: 'مرة',
    completed: false,
    category: 'sunnah'
  },
  {
    id: 'w-mulk',
    title: 'سورة الملك قبل النوم',
    description: 'المانعة والمنجية من عذاب القبر',
    target: 1,
    current: 0,
    unit: 'سورة',
    completed: false,
    category: 'quran'
  },
  {
    id: 'w-hawqala',
    title: 'الحوقلة (لا حول ولا قوة إلا بالله)',
    description: 'كنز من كنوز الجنة ودفع المشقات',
    target: 50,
    current: 0,
    unit: 'تسبيحة',
    completed: false,
    category: 'tasbeeh'
  }
];

export const initialAchievements: Achievement[] = [
  {
    id: 'ach-first',
    title: 'فاتحة الخير',
    description: 'أول تسبيحة أو ذكر تسجله في التطبيق',
    icon: 'Sparkles',
    conditionType: 'total_tasbeeh',
    targetValue: 1
  },
  {
    id: 'ach-100',
    title: 'الذاكر المثابر',
    description: 'الوصول إلى 100 تسبيحة إجمالية',
    icon: 'HeartHandshake',
    conditionType: 'total_tasbeeh',
    targetValue: 100
  },
  {
    id: 'ach-500',
    title: 'نور القلوب',
    description: 'الوصول إلى 500 تسبيحة',
    icon: 'SunMedium',
    conditionType: 'total_tasbeeh',
    targetValue: 500
  },
  {
    id: 'ach-1000',
    title: 'سفير التسبيح',
    description: 'الوصول إلى 1,000 تسبيحة',
    icon: 'Crown',
    conditionType: 'total_tasbeeh',
    targetValue: 1000
  },
  {
    id: 'ach-streak-3',
    title: 'ثبات البدايات',
    description: 'المواظبة على الأذكار 3 أيام متتالية',
    icon: 'Flame',
    conditionType: 'streak',
    targetValue: 3
  },
  {
    id: 'ach-streak-7',
    title: 'رياض الصالحين',
    description: 'المواظبة على الأذكار 7 أيام متتالية',
    icon: 'ShieldCheck',
    conditionType: 'streak',
    targetValue: 7
  },
  {
    id: 'ach-wird-full',
    title: 'الورد التام',
    description: 'إنجاز 100% من بنود الورد اليومي ليوم كامل',
    icon: 'CheckCheck',
    conditionType: 'wird_full',
    targetValue: 100
  }
];
