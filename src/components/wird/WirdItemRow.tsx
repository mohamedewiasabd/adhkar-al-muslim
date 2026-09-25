import React from 'react';
import { Check, BookOpen, Sparkles, Flame, CalendarCheck, Image as ImageIcon, Trash2 } from 'lucide-react';
import { DailyWirdItem } from '../../types';

interface WirdItemRowProps {
  item: DailyWirdItem;
  onToggle: () => void;
  onUpdateProgress: (delta: number) => void;
  onDelete: () => void;
  onImage: () => void;
}

const getItemIcon = (category: string) => {
  switch (category) {
    case 'quran': return <BookOpen className="w-4 h-4 text-emerald-600" />;
    case 'sunnah': return <Sparkles className="w-4 h-4 text-amber-500" />;
    case 'tasbeeh': return <Flame className="w-4 h-4 text-teal-600" />;
    default: return <CalendarCheck className="w-4 h-4 text-emerald-600" />;
  }
};

export const WirdItemRow: React.FC<WirdItemRowProps> = ({
  item,
  onToggle,
  onUpdateProgress,
  onDelete,
  onImage
}) => {
  const isDone = item.completed || item.current >= item.target;

  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
        isDone
          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
          : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            isDone
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'border-2 border-stone-300 dark:border-stone-700 text-transparent hover:border-emerald-500'
          }`}
        >
          <Check className="w-5 h-5 stroke-[3]" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
              {item.title}
            </span>
            {getItemIcon(item.category)}
          </div>
          {item.description && (
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {item.description}
            </p>
          )}
          {item.target > 1 && (
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => onUpdateProgress(-1)}
                disabled={item.current <= 0}
                className="w-6 h-6 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center text-xs font-bold disabled:opacity-30"
              >
                -
              </button>
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                {item.current} / {item.target} {item.unit}
              </span>
              <button
                onClick={() => onUpdateProgress(1)}
                disabled={item.current >= item.target}
                className="w-6 h-6 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center text-xs font-bold disabled:opacity-30"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onImage}
          className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="تصدير كبطاقة صورة جميلة"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {item.id.startsWith('custom-') && (
          <button
            onClick={onDelete}
            className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors"
            title="حذف هذا الورد"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};