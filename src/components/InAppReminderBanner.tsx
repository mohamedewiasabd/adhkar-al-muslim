import React, { useEffect, useState } from 'react';
import { Sparkles, X, Check, Bell } from 'lucide-react';
import { InAppAlert } from '../utils/notifications';
import { playBeadSound, triggerHaptic } from '../utils/audio';

interface InAppReminderBannerProps {
  alert: InAppAlert | null;
  onDismiss: () => void;
  onQuickCount: () => void;
}

export const InAppReminderBanner: React.FC<InAppReminderBannerProps> = ({
  alert,
  onDismiss,
  onQuickCount
}) => {
  const [counted, setCounted] = useState(false);

  useEffect(() => {
    setCounted(false);
    if (!alert) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, 9000);

    return () => clearTimeout(timer);
  }, [alert, onDismiss]);

  if (!alert) return null;

  const handleQuickTasbeeh = () => {
    onQuickCount();
    setCounted(true);
    playBeadSound();
    triggerHaptic(25);
    setTimeout(() => {
      onDismiss();
    }, 1200);
  };

  return (
    <div className="fixed top-24 inset-x-4 z-50 max-w-md mx-auto animate-bounce-short">
      <div className="p-4 rounded-3xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-2 border-emerald-500/40 shadow-2xl shadow-emerald-950/20 text-stone-900 dark:text-stone-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                {alert.title}
              </span>
              <p className="font-amiri font-bold text-base leading-snug mt-0.5">
                {alert.message}
              </p>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {alert.subtext && (
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 pr-10">
            {alert.subtext}
          </p>
        )}

        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 rounded-xl text-xs text-stone-500 hover:text-stone-700"
          >
            إغلاق
          </button>
          <button
            onClick={handleQuickTasbeeh}
            disabled={counted}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              counted
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30'
            }`}
          >
            {counted ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>تقبل الله (+1)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>تسبيح (+1)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
