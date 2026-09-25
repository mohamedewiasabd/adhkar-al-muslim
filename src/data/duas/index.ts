import { DuaItem } from '../../types';
import { QuranicItems } from './parts/00_quranic';
import { PropheticItems } from './parts/01_prophetic';
import { ReliefItems } from './parts/02_relief';
import { RizqItems } from './parts/03_rizq';
import { HealingItems } from './parts/04_healing';
import { FamilyItems } from './parts/05_family';
import { TravelItems } from './parts/06_travel';
import { QuranicItems2 } from './parts/07_quranic';
import { IstikharaItems } from './parts/08_istikhara';
import { ForgivenessItems } from './parts/09_forgiveness';
import { ParentsDeceasedItems } from './parts/10_parents_deceased';
import { QiyamSujoodItems } from './parts/11_qiyam_sujood';
import { RuqyahItems } from './parts/12_ruqyah';
import { NatureRamadanItems } from './parts/13_nature_ramadan';
import { QuranKhatmItems } from './parts/14_quran_khatm';
import { PropheticItems2 } from './parts/15_prophetic';
import { ReliefItems2 } from './parts/16_relief';
import { RizqItems2 } from './parts/17_rizq';
import { HealingItems2 } from './parts/18_healing';
import { ForgivenessItems2 } from './parts/19_forgiveness';
import { QiyamSujoodItems2 } from './parts/20_qiyam_sujood';
import { RuqyahItems2 } from './parts/21_ruqyah';
import { TravelItems2 } from './parts/22_travel';
import { NatureRamadanItems2 } from './parts/23_nature_ramadan';
import { QuranicItems3 } from './parts/24_quranic';
import { PropheticItems3 } from './parts/25_prophetic';
import { ReliefItems3 } from './parts/26_relief';
import { RizqItems3 } from './parts/27_rizq';
import { HealingItems3 } from './parts/28_healing';
import { FamilyItems2 } from './parts/29_family';
import { TravelItems3 } from './parts/30_travel';
import { ForgivenessItems3 } from './parts/31_forgiveness';
import { ParentsDeceasedItems2 } from './parts/32_parents_deceased';
import { QiyamSujoodItems3 } from './parts/33_qiyam_sujood';
import { RuqyahItems3 } from './parts/34_ruqyah';
import { NatureRamadanItems3 } from './parts/35_nature_ramadan';
import { AdabItems } from './parts/36_adab';
import { SpecialItems } from './parts/37_special';
import { NeedsItems } from './parts/38_needs';

// الوحدات المشطّاة حسب ترتيب الظهور في الملف الأصلي — أخفّ للمراجعة.
export const initialDuasData: DuaItem[] = [
  ...QuranicItems,
  ...PropheticItems,
  ...ReliefItems,
  ...RizqItems,
  ...HealingItems,
  ...FamilyItems,
  ...TravelItems,
  ...QuranicItems2,
  ...IstikharaItems,
  ...ForgivenessItems,
  ...ParentsDeceasedItems,
  ...QiyamSujoodItems,
  ...RuqyahItems,
  ...NatureRamadanItems,
  ...QuranKhatmItems,
  ...PropheticItems2,
  ...ReliefItems2,
  ...RizqItems2,
  ...HealingItems2,
  ...ForgivenessItems2,
  ...QiyamSujoodItems2,
  ...RuqyahItems2,
  ...TravelItems2,
  ...NatureRamadanItems2,
  ...QuranicItems3,
  ...PropheticItems3,
  ...ReliefItems3,
  ...RizqItems3,
  ...HealingItems3,
  ...FamilyItems2,
  ...TravelItems3,
  ...ForgivenessItems3,
  ...ParentsDeceasedItems2,
  ...QiyamSujoodItems3,
  ...RuqyahItems3,
  ...NatureRamadanItems3,
  ...AdabItems,
  ...SpecialItems,
  ...NeedsItems,
];
