import React from 'react';
import { Download, Copy, Check, Share2 } from 'lucide-react';

interface AyahExportActionsProps {
  copied: boolean;
  isExporting: boolean;
  onCopy: () => void;
  onShare: () => void;
  onDownload: () => void;
}

export const AyahExportActions: React.FC<AyahExportActionsProps> = ({
  copied,
  isExporting,
  onCopy,
  onShare,
  onDownload
}) => (
  <div className="pt-3.5 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-2 justify-between">
    <button
      onClick={onCopy}
      className="flex-1 min-w-[120px] py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
    >
      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
      <span>{copied ? 'تم نسخ نص الآية!' : 'نسخ النص'}</span>
    </button>

    <button
      onClick={onShare}
      className="flex-1 min-w-[120px] py-2.5 px-3 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
    >
      <Share2 className="w-4 h-4" />
      <span>مشاركة الصورة</span>
    </button>

    <button
      onClick={onDownload}
      disabled={isExporting}
      className="flex-1 min-w-[130px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
    >
      <Download className="w-4 h-4" />
      <span>{isExporting ? 'جارٍ التصدير...' : 'تحميل الصورة HD'}</span>
    </button>
  </div>
);