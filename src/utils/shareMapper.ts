import { DhikrItem } from '../types';
import { SelectedShareable } from '../components/ShareModal';

export type ShareExplicitType = 'dhikr' | 'dua' | 'wird' | 'quran';

const getCategoryName = (cat: string) => {
  switch (cat) {
    case 'morning': return 'أذكار الصباح';
    case 'evening': return 'أذكار المساء';
    case 'sleep': return 'أذكار النوم';
    case 'wake': return 'أذكار الاستيقاظ';
    case 'after_prayer': return 'أذكار بعد الصلاة';
    case 'masjid': return 'أذكار المسجد والأذان';
    case 'home': return 'أذكار المنزل والخلاء';
    case 'wudu': return 'أذكار الوضوء والطهارة';
    case 'food': return 'أذكار الطعام واللباس';
    case 'day_night': return 'أذكار اليوم والليلة';
    case 'stress': return 'أذكار الهم والحزن والكرب';
    case 'travel': return 'أذكار السفر والركوب';
    case 'weather': return 'أذكار المطر والرعد والريح';
    default: return 'أذكار';
  }
};

/** يحوّل أي عنصر قابل للمشاركة (ذكر/دعاء/ورد/آية) إلى صيغة نافذة المشاركة الموحدة. */
export function toSelectedShareable(item: any, explicitType?: ShareExplicitType): SelectedShareable {
  if (explicitType === 'quran' || item?.type === 'quran') {
    return {
      id: item.id,
      type: 'quran',
      title: item.title,
      text: item.text,
      reference: item.reference,
      categoryLabel: item.categoryLabel || 'القرآن الكريم'
    };
  }

  if (explicitType === 'wird' || item?.type === 'wird') {
    return {
      id: item.id,
      type: 'wird',
      title: item.title,
      text: item.text,
      fadlOrBenefit: item.fadlOrBenefit,
      reference: item.reference,
      categoryLabel: item.categoryLabel || 'ورد مأثور'
    };
  }

  if ('category' in item && typeof (item as DhikrItem).count === 'number') {
    const d = item as DhikrItem;
    const catName = getCategoryName(d.category);
    return {
      id: d.id,
      type: 'dhikr',
      title: catName,
      text: d.text,
      fadlOrBenefit: d.fadl,
      reference: d.reference,
      categoryLabel: catName
    };
  }

  const d = item as { id: string; title: string; arabic: string; benefit?: string; reference?: string };
  return {
    id: d.id,
    type: 'dua',
    title: d.title,
    text: d.arabic,
    fadlOrBenefit: d.benefit,
    reference: d.reference,
    categoryLabel: 'دعاء مأثور'
  };
}