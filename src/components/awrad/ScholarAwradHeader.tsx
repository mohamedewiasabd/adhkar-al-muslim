import React from 'react';
import { Sparkles } from 'lucide-react';

interface ScholarAwradHeaderProps {
  count: number;
}

export const ScholarAwradHeader: React.FC<ScholarAwradHeaderProps> = ({ count }) => (
  <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-800 via-stone-800 to-emerald-900 text-white shadow-lg relative overflow-hidden">
    <div className="relative z-10">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/20 text-amber-100 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          أوراد وأحزاب الأئمة والمشايخ
        </span>
        <span className="text-xs text-white/80 font-medium">
          {count} أوراد مأثورة
        </span>
      </div>

      <h2 className="text-lg font-extrabold mt-2 tracking-tight">
        أوراد كبار المشايخ والعلماء (الصوفية وغير الصوفية)
      </h2>
      <p className="text-xs text-stone-200 mt-1 leading-relaxed">
        مجموعة موثقة ونادرة تضم أوراد وأحزاب كبار أئمة السلف والحديث والفقهاء (كابن تيمية والشافعي وأحمد بن حنبل والحسن البصري)، وأعلام التصوف السني المعتدل (كالنووي والشاذلي والحداد والجيلاني والغزالي).
      </p>
    </div>
  </div>
);