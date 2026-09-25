import React from 'react';
import { Sparkles, BookOpen, ListChecks, Target } from 'lucide-react';
import { WidgetType } from '../../utils/widgets';

export interface WidgetTypeMeta {
  icon: React.ReactNode;
  label: string;
  btn: string;
  chip: string;
}

export const TYPE_META: Record<WidgetType, WidgetTypeMeta> = {
  tasbeeh: {
    icon: <Target className="w-4 h-4" />,
    label: 'سبحة',
    btn: 'border-emerald-300/60 bg-emerald-50 text-emerald-600',
    chip: 'bg-emerald-100 text-emerald-600'
  },
  adhkar: {
    icon: <Sparkles className="w-4 h-4" />,
    label: 'أذكار',
    btn: 'border-teal-300/60 bg-teal-50 text-teal-600',
    chip: 'bg-teal-100 text-teal-600'
  },
  dua: {
    icon: <BookOpen className="w-4 h-4" />,
    label: 'دعاء اليوم',
    btn: 'border-amber-300/60 bg-amber-50 text-amber-600',
    chip: 'bg-amber-100 text-amber-600'
  },
  awrad: {
    icon: <ListChecks className="w-4 h-4" />,
    label: 'الورد اليومي',
    btn: 'border-sky-300/60 bg-sky-50 text-sky-600',
    chip: 'bg-sky-100 text-sky-600'
  }
};