import React from 'react';
import { Sparkles } from 'lucide-react';

interface WirdBannerProps {
  totalItems: number;
  completedCount: number;
  completionPercent: number;
}

export const WirdBanner: React.FC<WirdBannerProps> = ({
  totalItems,
  completedCount,
  completionPercent
}) => (
  <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-700/20 relative overflow-hidden">
    <div className="relative z-10">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-white/90 inline-block mb-1">
            الورد اليومي
          </span>
          <h2 className="text-xl font-bold">جدول الطاعات اليومية</h2>
          <p className="text-xs text-white/80 mt-0.5">
            أحب الأعمال إلى الله أدومها وإن قل
          </p>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex flex-col items-center justify-center border border-white/20">
          <span className="text-lg font-black">{completionPercent}%</span>
          <span className="text-[10px] text-white/80 font-medium">مكتمل</span>
        </div>
      </div>

      <div className="mt-4 w-full h-2 rounded-full bg-black/20 overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-300 shadow-sm"
          style={{ width: `${completionPercent}%` }}
        />
      </div>

      <div className="mt-2 text-xs flex justify-between text-white/80 font-medium">
        <span>{completedCount} من أصل {totalItems} مهام</span>
        {completionPercent === 100 && (
          <span className="font-bold text-amber-200 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> تم إنجاز وردك كاملاً لليوم!
          </span>
        )}
      </div>
    </div>
  </div>
);