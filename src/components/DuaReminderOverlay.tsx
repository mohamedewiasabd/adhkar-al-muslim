import React, { useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { InAppAlert } from '../utils/notifications';
import { triggerHaptic } from '../utils/audio';

interface DuaReminderOverlayProps {
  alert: InAppAlert | null;
  onDismiss: () => void;
}

export const DuaReminderOverlay: React.FC<DuaReminderOverlayProps> = ({
  alert,
  onDismiss
}) => {
  useEffect(() => {
    if (!alert) return;
    triggerHaptic(40);
    const timer = setTimeout(() => {
      onDismiss();
    }, 12000);
    return () => clearTimeout(timer);
  }, [alert, onDismiss]);

  if (!alert) return null;

  const subParts = alert.subtext ? alert.subtext.split(' [') : [];

  return (
    <div
      onClick={onDismiss}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      dir="rtl"
    >
      <div className="w-full max-w-lg relative bg-white dark:bg-stone-900 rounded-[2rem] border border-emerald-500/40 shadow-2xl shadow-emerald-950/40 overflow-hidden text-center" dir="rtl">
        {/* Decorative top gradient */}
        <div className="h-20 bg-gradient-to-b from-emerald-500/20 to-transparent relative">
          <div className="absolute -top-8 inset-x-0">
            <Sparkles className="w-full text-emerald-500/15" />
          </div>
          <div className="absolute top-2 right-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="absolute bottom-3 inset-x-0 text-center">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wide">
              {alert.title}
            </span>
          </div>
        </div>

        <button
          onClick={onDismiss}
          aria-label="إغلاق"
          className="absolute top-3 left-3 p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* The Dua text */}
        <p className="font-amiri font-bold text-2xl md:text-[1.75rem] leading-[2.2] text-stone-900 dark:text-stone-50 px-6 pb-4 pt-2">
          {alert.message}
        </p>

        {Array.isArray(subParts) && subParts.length > 0 && (
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed px-8 pb-1">
            {subParts[0]}
            {subParts.length > 1 && (
              <span className="block text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                [المصدر: {subParts[1].replace(']', '')}]
              </span>
            )}
          </p>
        )}

        <div className="p-4 pt-5 bg-stone-50/70 dark:bg-stone-950/40 mt-4">
          <button
            onClick={onDismiss}
            className="px-8 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
          >
            آمين — تقبّل الله 🚪
          </button>
        </div>
      </div>
    </div>
  );
};