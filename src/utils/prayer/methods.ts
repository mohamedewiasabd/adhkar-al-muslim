import {
  CalculationMethod,
  CalculationParameters,
  Madhab,
  Rounding,
} from 'adhan';
import { PrayerMethodDef, PrayerSettings } from './types';

export const PRAYER_METHODS: PrayerMethodDef[] = [
  { id: 'egypt', label: 'هيئة المساحة المصرية', build: () => CalculationMethod.Egyptian() },
  { id: 'mwl', label: 'رابطة العالم الإسلامي', build: () => CalculationMethod.MuslimWorldLeague() },
  { id: 'makkah', label: 'أم القرى - مكة المكرمة', build: () => CalculationMethod.UmmAlQura() },
  { id: 'isna', label: 'ISNA - أمريكا الشمالية', build: () => CalculationMethod.NorthAmerica() },
  { id: 'karachi', label: 'جامعة كراتشي', build: () => CalculationMethod.Karachi() },
  {
    id: 'gulf',
    label: 'دول الخليج',
    build: () => {
      const p = CalculationMethod.Other();
      p.fajrAngle = 19.5;
      p.ishaAngle = 0;
      p.ishaInterval = 90;
      return p;
    },
  },
  { id: 'kuwait', label: 'الكويت', build: () => CalculationMethod.Kuwait() },
  { id: 'qatar', label: 'قطر', build: () => CalculationMethod.Qatar() },
  { id: 'singapore', label: 'سنغافورة', build: () => CalculationMethod.Singapore() },
  {
    id: 'france',
    label: 'اتحاد المنظمات الإسلامية بفرنسا (UOIF)',
    build: () => {
      const p = CalculationMethod.Other();
      p.fajrAngle = 12;
      p.ishaAngle = 12;
      p.maghribAngle = 0;
      p.ishaInterval = 0;
      return p;
    },
  },
  { id: 'turkey', label: 'تركيا', build: () => CalculationMethod.Turkey() },
  {
    id: 'russia',
    label: 'روسيا',
    build: () => {
      const p = CalculationMethod.Other();
      p.fajrAngle = 16;
      p.ishaAngle = 15;
      p.maghribAngle = 0;
      p.ishaInterval = 0;
      return p;
    },
  },
  { id: 'tehran', label: 'طهران', build: () => CalculationMethod.Tehran() },
  {
    id: 'jafari',
    label: 'جعفري',
    build: () => {
      const p = CalculationMethod.Other();
      p.fajrAngle = 16;
      p.ishaAngle = 14;
      p.maghribAngle = 4;
      p.ishaInterval = 0;
      return p;
    },
  },
  { id: 'moonsighting', label: 'مؤتمر رؤية الهلال (Moonsighting)', build: () => CalculationMethod.MoonsightingCommittee() },
  { id: 'dubai', label: 'دبي', build: () => CalculationMethod.Dubai() },
  { id: 'custom', label: 'زوايا مخصصة (فجر/عشاء يدوياً)', build: () => CalculationMethod.Other() },
];

export function methodLabel(id: string): string {
  const m = PRAYER_METHODS.find(method => method.id === id);
  return m ? m.label : 'هيئة المساحة المصرية';
}

export function buildParameters(settings: PrayerSettings): CalculationParameters {
  const def = PRAYER_METHODS.find(method => method.id === settings.method) || PRAYER_METHODS[0];
  const params = def.build();

  if (settings.method === 'custom') {
    params.fajrAngle = settings.fajrAngle || 19.5;
    params.ishaAngle = settings.ishaAngle || 17.5;
    params.maghribAngle = 0;
    params.ishaInterval = 0;
  }

  params.madhab = settings.asr === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  params.rounding = Rounding.Nearest;

  return params;
}