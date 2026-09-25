import React from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { WidgetSpec, widgetsTypeLabel } from '../../utils/widgets';
import { TYPE_META } from './widgetsMeta';

interface WidgetListItemProps {
  widget: WidgetSpec;
  onToggle: () => void;
  onRemove: () => void;
}

export const WidgetListItem: React.FC<WidgetListItemProps> = ({ widget, onToggle, onRemove }) => {
  const meta = TYPE_META[widget.type] || TYPE_META.tasbeeh;
  const visible = widget.visible ?? true;

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
      <div className={`w-10 h-10 rounded-2xl ${meta.chip} flex items-center justify-center shrink-0`}>
        {meta.icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-sm text-stone-900 dark:text-stone-100 font-cairo truncate">
          {widget.title || widgetsTypeLabel(widget.type)}
        </p>
        <p className="text-[11px] text-stone-500 dark:text-stone-400">
          {widgetsTypeLabel(widget.type)} · الحجم: {widget.size === 'small' ? 'صغير' : widget.size === 'large' ? 'كبير' : 'متوسط'}
        </p>
      </div>
      <button
        onClick={onToggle}
        className={`p-2 rounded-xl shrink-0 transition-colors ${
          visible ? 'text-sky-600 hover:bg-sky-50' : 'text-stone-400 hover:bg-stone-100'
        }`}
        title={visible ? 'إخفاء الودجد' : 'إظهار الودجد'}
      >
        {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
      <button
        onClick={onRemove}
        className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0 transition-colors"
        title="حذف الودجد نهائياً"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};