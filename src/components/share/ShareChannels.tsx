import React from 'react';
import {
  Copy,
  Check,
  Share2,
  Send,
  MessageCircle,
  Mail,
  MessageSquare,
  Image as ImageIcon
} from 'lucide-react';

interface ShareChannelsProps {
  copied: boolean;
  onCopy: () => void;
  onWhatsApp: () => void;
  onTelegram: () => void;
  onTwitter: () => void;
  onLine: () => void;
  onViber: () => void;
  onPinterest: () => void;
  onEmail: () => void;
  onSms: () => void;
  onNative: () => void;
  onExportImage: () => void;
}

/** قنوات المشاركة (واتساب/تيليجرام/إكس/LINE/Viber/Pinterest/إيميل/رسالة) وأزرار التصدير. */
export const ShareChannels: React.FC<ShareChannelsProps> = ({
  copied,
  onCopy,
  onWhatsApp,
  onTelegram,
  onTwitter,
  onLine,
  onViber,
  onPinterest,
  onEmail,
  onSms,
  onNative,
  onExportImage
}) => {
  return (
    <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
      {/* Direct Image Export Banner button */}
      <button
        onClick={onExportImage}
        id="btn-export-as-image-banner"
        className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 hover:brightness-105 transition-all cursor-pointer"
      >
        <ImageIcon className="w-4 h-4" />
        <span>تصدير هذا النص كبطاقة مصممة (صورة HD للواتساب والستوري)</span>
      </button>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onWhatsApp}
          id="btn-share-whatsapp"
          className="py-2.5 px-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#25D366]/20 transition-transform active:scale-98 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>واتساب</span>
        </button>

        <button
          onClick={onTelegram}
          id="btn-share-telegram"
          className="py-2.5 px-3 rounded-2xl bg-[#229ED9] hover:bg-[#1e8ec3] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#229ED9]/20 transition-transform active:scale-98 cursor-pointer"
        >
          <Send className="w-4 h-4 fill-white" />
          <span>تيليجرام</span>
        </button>

        <button
          onClick={onTwitter}
          id="btn-share-twitter"
          className="py-2.5 px-3 rounded-2xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-98 cursor-pointer"
        >
          <span className="font-bold text-sm">𝕏</span>
          <span>منصة إكس</span>
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        <button
          onClick={onLine}
          id="btn-share-line"
          className="py-2.5 px-1 rounded-2xl bg-[#06C755] hover:bg-[#05b34c] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-md shadow-[#06C755]/20 transition-transform active:scale-98 cursor-pointer"
        >
          <span>LINE</span>
        </button>

        <button
          onClick={onViber}
          id="btn-share-viber"
          className="py-2.5 px-1 rounded-2xl bg-[#7360F2] hover:bg-[#6250dc] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-md shadow-[#7360F2]/20 transition-transform active:scale-98 cursor-pointer"
        >
          <span>Viber</span>
        </button>

        <button
          onClick={onPinterest}
          id="btn-share-pinterest"
          className="py-2.5 px-1 rounded-2xl bg-[#E60023] hover:bg-[#cf001f] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-md shadow-[#E60023]/20 transition-transform active:scale-98 cursor-pointer"
        >
          <span>Pinterest</span>
        </button>

        <button
          onClick={onEmail}
          id="btn-share-email"
          className="py-2.5 px-1 rounded-2xl bg-[#D93025] hover:bg-[#c42a1e] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-md shadow-[#D93025]/20 transition-transform active:scale-98 cursor-pointer"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>إيميل</span>
        </button>

        <button
          onClick={onSms}
          id="btn-share-sms"
          className="py-2.5 px-1 rounded-2xl bg-[#34B7F1] hover:bg-[#24a6e0] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-md shadow-[#34B7F1]/20 transition-transform active:scale-98 cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>رسالة</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          id="btn-export-image-bottom"
          onClick={onExportImage}
          className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-transform active:scale-98 cursor-pointer"
          title="تصدير هذا المحتوى في بطاقة صورة فائقة الجودة"
        >
          <ImageIcon className="w-4 h-4" />
          <span>تصدير كصورة</span>
        </button>

        <button
          onClick={onNative}
          id="btn-share-native"
          className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-transform active:scale-98 cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>مشاركة نصية</span>
        </button>

        <button
          onClick={onCopy}
          id="btn-copy-formatted-text"
          className={`py-3 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            copied
              ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-500 text-emerald-700 dark:text-emerald-300'
              : 'border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>تم النسخ!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>نسخ النص</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};