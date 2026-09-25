import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface WidgetPermissionCardProps {
  onGrant: () => void;
}

export const WidgetPermissionCard: React.FC<WidgetPermissionCardProps> = ({ onGrant }) => (
  <div className="rounded-3xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 flex items-center gap-3">
    <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
    <div className="flex-1 text-right">
      <p className="text-sm font-bold text-amber-900 dark:text-amber-100">يحتاج إذن «الرسم فوق التطبيقات»</p>
      <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5 leading-relaxed">
        ليعرض التطبيق الودجات فوق أي تطبيق وعلى شاشة القفل.
      </p>
    </div>
    <button
      onClick={onGrant}
      className="shrink-0 px-3 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors cursor-pointer"
    >
      منح الإذن
    </button>
  </div>
);