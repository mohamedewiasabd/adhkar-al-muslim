import { DhikrItem } from '../../types';
import { MorningItems } from './parts/00_morning';
import { EveningItems } from './parts/01_evening';
import { SleepItems } from './parts/02_sleep';
import { WakeItems } from './parts/03_wake';
import { AfterPrayerItems } from './parts/04_after_prayer';
import { MasjidItems } from './parts/05_masjid';
import { HomeItems } from './parts/06_home';
import { WuduItems } from './parts/07_wudu';
import { FoodItems } from './parts/08_food';
import { DayNightItems } from './parts/09_day_night';
import { StressItems } from './parts/10_stress';
import { TravelItems } from './parts/11_travel';
import { WeatherItems } from './parts/12_weather';
import { QiyamItems } from './parts/13_qiyam';

// الوحدات المشطّاة حسب ترتيب الظهور في الملف الأصلي — أخفّ للمراجعة.
export const initialAdhkarData: DhikrItem[] = [
  ...MorningItems,
  ...EveningItems,
  ...SleepItems,
  ...WakeItems,
  ...AfterPrayerItems,
  ...MasjidItems,
  ...HomeItems,
  ...WuduItems,
  ...FoodItems,
  ...DayNightItems,
  ...StressItems,
  ...TravelItems,
  ...WeatherItems,
  ...QiyamItems,
];
