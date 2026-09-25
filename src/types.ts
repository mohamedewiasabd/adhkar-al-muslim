export type DhikrCategory = 'morning' | 'evening' | 'sleep' | 'wake' | 'after_prayer' | 'masjid' | 'home' | 'wudu' | 'food' | 'day_night' | 'stress' | 'travel' | 'weather' | 'tasbeeh' | 'qiyam';

export interface DhikrItem {
  id: string;
  category: DhikrCategory;
  text: string;
  count: number;
  currentCount: number;
  fadl?: string;
  reference?: string;
  completed?: boolean;
}

export interface DuaCategory {
  id: string;
  name: string;
  icon?: string;
}

export type TasbeehCategory = 'all' | 'tasbeeh' | 'istighfar' | 'salawat' | 'tahlil' | 'dua' | 'custom';

export interface TasbeehItem {
  id: string;
  title: string;
  count: number | 'infinity';
  fadl?: string;
  reference?: string;
  category?: TasbeehCategory;
  isCustom?: boolean;
}

export interface DuaItem {
  id: string;
  title: string;
  arabic: string;
  reference: string;
  category: string;
  benefit?: string;
  isFavorite?: boolean;
}

export interface AsmaAlHusnaItem {
  id: string;
  number: number;
  name: string;
  meaning: string;
  fadl: string;
  reference: string;
}

export type RuqyaPhase = 'opening' | 'quran' | 'prophetic' | 'closing';

export interface RuqyaItem {
  id: string;
  phase: RuqyaPhase;
  order: number;
  title: string;
  arabic: string;
  repetition: number;
  reference: string;
  note?: string;
}

export interface RuqyaGuidance {
  id: string;
  title: string;
  text: string;
}

export interface OurApp {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  storeUrl?: string;
  packageName?: string;
  category?: string;
  createdAt?: string;
}

export interface DailyWirdItem {
  id: string;
  title: string;
  description?: string;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
  category: 'quran' | 'adhkar' | 'sunnah' | 'tasbeeh';
}

export type ScholarTradition = 'non_sufi' | 'sufi' | 'all';

export interface WirdSection {
  id: string;
  order: number;
  text: string;
  count: number;
  currentCount?: number;
  instruction?: string;
  virtue?: string;
}

export interface ScholarWirdItem {
  id: string;
  title: string;
  scholar: string;
  scholarEra?: string;
  tradition: 'non_sufi' | 'sufi'; // غير صوفية (أئمة الحديث والفقه والسلف) | صوفية (مشايخ وأعلام التصوف السني)
  category: string;
  shortDescription: string;
  sourceReference: string;
  recommendedTime: string;
  fullText: string;
  sections: WirdSection[];
  isPopular?: boolean;
}

export interface DailyHistoryRecord {
  date: string; // YYYY-MM-DD
  tasbeehCount: number;
  morningCompleted: boolean;
  eveningCompleted: boolean;
  wirdCompletionRate: number; // 0 - 100
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  conditionType: 'total_tasbeeh' | 'streak' | 'morning_evening_same_day' | 'wird_full';
  targetValue: number;
}

export interface ReminderSettings {
  enabled: boolean;
  intervalMinutes: number; // e.g. 30, 60
  morningTime: string; // e.g. "06:30"
  eveningTime: string; // e.g. "17:30"
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  lastReminderTimestamp?: number;
  qiyamEnabled: boolean; // تذكير بمفاتيح قيام الليل
  qiyamTime: string; // وقت قيام الليل المقصود، يُرسل التذكير قبله بنصف ساعة (e.g. "03:00")
}

export type ActiveTab = 'adhkar' | 'prayer' | 'quran' | 'tasbeeh' | 'wird' | 'duas' | 'stats';

// --- Quran & Reading / Hifz Tracking Types ---
export interface SurahMeta {
  number: number;
  name: string; // Arabic name, e.g. "الفاتحة"
  englishName: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  pageStart: number;
  juzStart: number;
}

export interface AyahItem {
  number: number; // overall number in Quran
  numberInSurah: number;
  text: string;
  juz: number;
  page: number;
  sajda?: boolean;
}

export interface QuranBookmark {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  ayahTextSnippet: string;
  updatedAt: string; // ISO string
  note?: string;
}

export interface QuranReadingWirdGoal {
  dailyPagesTarget: number; // e.g. 4 pages (or 1 Hizb)
  currentDayPagesRead: number;
  lastReadSurah: number;
  lastReadAyah: number;
  lastReadPage: number;
  lastReadDate: string; // YYYY-MM-DD
  completedKhatmasCount: number;
  historyLog: {
    date: string; // YYYY-MM-DD
    pagesRead: number;
    surahNumber: number;
    ayahNumber: number;
  }[];
}

export type HifzStatus = 'not_started' | 'memorizing' | 'memorized' | 'mastered';

export interface SurahHifzProgress {
  surahNumber: number;
  status: HifzStatus;
  memorizedAyahsCount: number;
  lastReviewedDate?: string; // YYYY-MM-DD
  revisionStrength?: 1 | 2 | 3 | 4 | 5; // 1 weak to 5 solid
  notes?: string;
}
