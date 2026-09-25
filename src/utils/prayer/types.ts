import { CalculationParameters } from 'adhan';

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export const PRAYER_ORDER: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const PRAYER_ARABIC: Record<PrayerName, string> = {
  fajr: 'الفجر',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

export type AsrMadhab = 'standard' | 'hanafi';
export type HighLatitudePref = 'recommended' | 'middle' | 'one_seventh' | 'angle';

export interface PrayerSettings {
  method: string;
  lat: number;
  lng: number;
  city: string;
  asr: AsrMadhab;
  highLats: HighLatitudePref;
  adhanEnabled: boolean;
  adhanPerPrayer: Record<PrayerName, boolean>;
  reminderEnabled: boolean;
  reminderLead: number;
  owabinReminder: boolean;
  tahajjudReminder: boolean;
  fajrAngle: number;
  ishaAngle: number;
  tz: string;
}

export interface PrayerMethodDef {
  id: string;
  label: string;
  build: () => CalculationParameters;
}

export const DEFAULT_SETTINGS: PrayerSettings = {
  method: 'egypt',
  lat: 30.0444,
  lng: 31.2357,
  city: 'القاهرة',
  asr: 'standard',
  highLats: 'recommended',
  adhanEnabled: true,
  adhanPerPrayer: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
  reminderEnabled: true,
  reminderLead: 10,
  owabinReminder: true,
  tahajjudReminder: true,
  fajrAngle: 19.5,
  ishaAngle: 17.5,
  tz: 'Africa/Cairo',
};

export type PrayerTimeKey = 'imsak' | 'fajr' | 'sunrise' | 'dhuhr' | 'owabin' | 'asr' | 'maghrib' | 'isha' | 'midnight' | 'lastThird';

export interface DailyPrayerTimes {
  date: string;
  imsak: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  owabin: string;
  asr: string;
  maghrib: string;
  isha: string;
  midnight: string;
  lastThird: string;
}

export interface NextPrayer {
  name: PrayerName;
  arabic: string;
  time: string;
  minutesLeft: number;
  isTomorrow: boolean;
  date: string;
}

export interface WallParts {
  y: number;
  m: number;
  d: number;
  h: number;
  minute: number;
}