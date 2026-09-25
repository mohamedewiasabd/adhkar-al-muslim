import React from 'react';
import { Plus } from 'lucide-react';
import { WidgetType } from '../../utils/widgets';
import { TYPE_META } from './widgetsMeta';

interface WidgetQuickAddGridProps {
  onAdd: (type: WidgetType) => void;
}

export const WidgetQuickAddGrid: React.FC<WidgetQuickAddGridProps> = ({ onAdd }) => (
  <div className="grid grid-cols-2 gap-2">
    {(Object.keys(TYPE_META) as WidgetType[]).map((type) => {
      const meta = TYPE_META[type];
      return (
        <button
          key={type}
          onClick={() => onAdd(type)}
          className={`flex items-center justify-center gap-2 p-3 rounded-2xl border ${meta.btn} dark:bg-stone-800/60 text-stone-700 dark:text-stone-200 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer`}
        >
          <span>{meta.icon}</span>
          <span>أضف {meta.label}</span>
          <Plus className="w-3.5 h-3.5 text-stone-400" />
        </button>
      );
    })}
  </div>
);