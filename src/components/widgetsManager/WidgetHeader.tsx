import React from 'react';
import { X, LayoutGrid } from 'lucide-react';

interface WidgetHeaderProps {
  onClose: () => void;
}

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({ onClose }) => (
  <div className="bg-gradient-to-tr from-sky-600 via-sky-500 to-teal-500 text-white px-5 pt-5 pb-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
          <LayoutGrid className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold font-cairo">الودجات العائمة</h2>
          <p className="text-[11px] text-white/80">سبحة، أدعية، أذكار وأوراد فوق أي شاشة</p>
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="إغلاق"
        className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer"
      >
        <X className="w-4.5 h-4.5" />
      </button>
    </div>
  </div>
);