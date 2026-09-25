import { LucideIcon } from 'lucide-react';
import { Bookmark, ShieldCheck, Heart, Star } from 'lucide-react';

export type AwradFilter =
  | 'all'
  | 'sahaba'
  | 'non_sufi'
  | 'sufi'
  | 'nawawi'
  | 'shadhili'
  | 'haddad'
  | 'ghazali'
  | 'favorites';

export interface AwradFilterTab {
  id: AwradFilter;
  label: string;
  icon?: LucideIcon;
}

export const AWARD_FILTER_TABS: AwradFilterTab[] = [
  { id: 'all', label: 'الكل' },
  { id: 'sahaba', label: 'الصحابة والتابعون', icon: Bookmark },
  { id: 'non_sufi', label: 'أئمة الحديث والفقه (غير صوفية)', icon: ShieldCheck },
  { id: 'sufi', label: 'مشايخ التصوف السني', icon: Heart },
  { id: 'nawawi', label: 'الإمام النووي' },
  { id: 'shadhili', label: 'السادة الشاذلية' },
  { id: 'haddad', label: 'السادة باعلوي' },
  { id: 'ghazali', label: 'الإمام الغزالي' },
  { id: 'favorites', label: 'المفضلة', icon: Star }
];