import { ScholarWirdItem } from '../../types';
import { أئمةالحديثوالفقهItems } from './parts/00_أئمة_الحديث_والفقه';
import { الإمامالنوويItems } from './parts/01_الإمام_النووي';
import { السادةالشاذليةItems } from './parts/02_السادة_الشاذلية';
import { السادةباعلويوحضرموتItems } from './parts/03_السادة_باعلوي_وحضرموت';
import { السادةالقادريةوالرفاعيةItems } from './parts/04_السادة_القادرية_والرفاعية';
import { الإمامالغزاليItems } from './parts/05_الإمام_الغزالي';
import { السيدأحمدبنإدريسItems } from './parts/06_السيد_أحمد_بن_إدريس';
import { السادةالشاذليةItems2 } from './parts/07_السادة_الشاذلية';
import { المسبعاتالعشرItems } from './parts/08_المسبعات_العشر';
import { السادةالأحمديةItems } from './parts/09_السادة_الأحمدية';
import { الصحابةوالتابعونItems } from './parts/10_الصحابة_والتابعون';
import { السادةباعلويItems } from './parts/11_السادة_باعلوي';
import { السادةالشاذليةItems3 } from './parts/12_السادة_الشاذلية';
import { أئمةالحديثوالفقهItems2 } from './parts/13_أئمة_الحديث_والفقه';

// الوحدات المشطّاة حسب ترتيب الظهور في الملف الأصلي — أخفّ للمراجعة.
export const scholarAwradList: ScholarWirdItem[] = [
  ...أئمةالحديثوالفقهItems,
  ...الإمامالنوويItems,
  ...السادةالشاذليةItems,
  ...السادةباعلويوحضرموتItems,
  ...السادةالقادريةوالرفاعيةItems,
  ...الإمامالغزاليItems,
  ...السيدأحمدبنإدريسItems,
  ...السادةالشاذليةItems2,
  ...المسبعاتالعشرItems,
  ...السادةالأحمديةItems,
  ...الصحابةوالتابعونItems,
  ...السادةباعلويItems,
  ...السادةالشاذليةItems3,
  ...أئمةالحديثوالفقهItems2,
];
