import React from 'react';
import { AlertTriangle, Smartphone } from 'lucide-react';

export const WidgetsTips: React.FC = () => (
  <>
    <div className="rounded-3xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30 p-4 text-[11px] text-sky-800 dark:text-sky-200 leading-relaxed space-y-1">
      <p className="flex items-start gap-1.5"><AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> اسحب الودجد بأي مكان في الشاشة، واضغط عليه للعدّ/الانتقال للذكر التالي.</p>
      <p className="flex items-start gap-1.5"><AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> اضغط مطوّلاً على الودجد لإخفائه أو حذفه.</p>
      <p className="flex items-start gap-1.5"><AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> يظهر فوق كل التطبيقات وعلى شاشة القفل عند إيقاظ الجهاز (أندرويد 10+). تعمل الودجات حتى بعد إغلاق التطبيق.</p>
    </div>

    <div className="rounded-3xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/30 p-4 text-[11px] text-teal-800 dark:text-teal-200 leading-relaxed space-y-1">
      <p className="font-bold flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 shrink-0" /> ويدجات الشاشة الرئيسية (6 أنواع)</p>
      <p className="flex items-start gap-1.5"><AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> «مسبحة أذكار» · «دعاء اليوم» · «أذكار الصباح والمساء» · «أسماء الله الحسنى».</p>
      <p className="flex items-start gap-1.5"><AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> اضغط مطوّلاً على الشاشة الرئيسية → «عناصر واجهة المستخدم» → اسحب الودجد المطلوب إلى المساحة.</p>
      <p className="flex items-start gap-1.5"><AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> اضغط على الودجد للتفاعل (عدّ/تمييز/انتقال) — دون فتح التطبيق.</p>
    </div>
  </>
);