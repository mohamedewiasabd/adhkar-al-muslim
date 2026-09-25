import React, { useState } from 'react';
import {
  Check,
  Copy,
  Share2,
  RotateCcw,
  Plus,
  Star,
  Volume2,
  VolumeX,
  Image as ImageIcon
} from 'lucide-react';
import { ScholarWirdItem, WirdSection } from '../../types';
import { playBeadSound, playCompletionChime, triggerHaptic } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { WirdInteractiveRecitation } from './WirdInteractiveRecitation';

type RecitationMode = 'interactive' | 'full';

interface WirdRecitationModalProps {
  wird: ScholarWirdItem;
  soundEnabled: boolean;
  onToggleSound?: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e?: React.MouseEvent) => void;
  onClose: () => void;
  onCopyFullText: (text: string) => void;
  onShare: (wird: ScholarWirdItem) => void;
  onExportImage: (wird: ScholarWirdItem, text: string) => void;
  onAddToDaily: (wird: ScholarWirdItem, e?: React.MouseEvent) => void;
  fontSize: 'small' | 'medium' | 'large';
}

/** نافذة تلاوة الورد: وضع تفاعلي بعداد لكل فقرة، أو قراءة النص الكامل مع أدوات المشاركة. */
export const WirdRecitationModal: React.FC<WirdRecitationModalProps> = ({
  wird,
  soundEnabled,
  onToggleSound,
  isFavorite,
  onToggleFavorite,
  onClose,
  onCopyFullText,
  onShare,
  onExportImage,
  onAddToDaily,
  fontSize
}) => {
  const [recitationMode, setRecitationMode] = useState<RecitationMode>('interactive');
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [sectionCounts, setSectionCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    wird.sections.forEach(s => {
      initial[s.id] = 0;
    });
    return initial;
  });

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-base leading-relaxed';
      case 'large': return 'text-2xl leading-loose';
      default: return 'text-lg leading-loose';
    }
  };

  const handleCountSection = (section: WirdSection) => {
    const current = sectionCounts[section.id] || 0;
    if (current < section.count) {
      const nextCount = current + 1;
      setSectionCounts(prev => ({ ...prev, [section.id]: nextCount }));

      if (soundEnabled) {
        playBeadSound();
      }
      triggerHaptic(nextCount === section.count ? 45 : 20);

      // If reached count for this section
      if (nextCount === section.count) {
        if (soundEnabled) {
          playCompletionChime();
        }
        // If this is the last section, celebration!
        if (currentSectionIndex === (wird?.sections.length ?? 0) - 1) {
          try {
            confetti({
              particleCount: 80,
              spread: 80,
              origin: { y: 0.6 }
            });
          } catch {
            // ignore
          }
        }
      }
    }
  };

  const handleResetWirdRecitation = () => {
    const initialCounts: Record<string, number> = {};
    wird.sections.forEach(s => {
      initialCounts[s.id] = 0;
    });
    setSectionCounts(initialCounts);
    setCurrentSectionIndex(0);
    triggerHaptic(30);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="w-full max-w-xl max-h-[92vh] bg-white dark:bg-stone-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200 dark:border-stone-800">
        {/* Modal Top Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                wird.tradition === 'non_sufi'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
              }`}>
                {wird.tradition === 'non_sufi' ? 'أئمة الحديث والفقه' : 'مشايخ التصوف السني'}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                {wird.scholar}
              </span>
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-0.5">
              {wird.title}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            {onToggleSound && (
              <button
                onClick={onToggleSound}
                className="p-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-xl"
                title="كتم / تفعيل الصوت"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
              </button>
            )}
            <button
              onClick={() => onToggleFavorite(wird.id)}
              className="p-2 text-stone-500 hover:text-amber-500 rounded-xl"
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-lg font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-900/50 px-4 py-2 gap-2">
          <button
            onClick={() => setRecitationMode('interactive')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              recitationMode === 'interactive'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            التلاوة التفاعلية والعداد ({wird.sections.length} فقرات)
          </button>
          <button
            onClick={() => setRecitationMode('full')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              recitationMode === 'full'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            قراءة النص الكامل
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {recitationMode === 'full' ? (
            /* Full Text Continuous Reader */
            <div className="space-y-4">
              {/* Reference & Virtue Info */}
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs space-y-1">
                <div className="font-bold text-stone-800 dark:text-stone-200">
                  📖 المرجع والتخريج: <span className="font-normal text-stone-600 dark:text-stone-400">{wird.sourceReference}</span>
                </div>
                <div className="text-stone-600 dark:text-stone-400">
                  🕒 الوقت المستحب: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{wird.recommendedTime}</span>
                </div>
              </div>

              {/* Full Text Display */}
              <div className={`font-arabic p-5 rounded-3xl bg-amber-50/40 dark:bg-stone-850/60 border border-amber-200/50 dark:border-stone-800 text-stone-900 dark:text-stone-100 whitespace-pre-line text-right ${getFontSizeClass()}`}>
                {wird.fullText}
              </div>
            </div>
          ) : (
            /* Interactive Step-by-Step Recitation Mode */
            <WirdInteractiveRecitation
              wird={wird}
              sectionCounts={sectionCounts}
              currentSectionIndex={currentSectionIndex}
              fontClass={getFontSizeClass()}
              onCountSection={handleCountSection}
              onSectionChange={setCurrentSectionIndex}
            />
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onCopyFullText(wird.fullText)}
              className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ النص</span>
            </button>

            <button
              onClick={() => onShare(wird)}
              className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة</span>
            </button>

            <button
              onClick={() => {
                const textToExport = recitationMode === 'interactive' && wird.sections[currentSectionIndex]
                  ? wird.sections[currentSectionIndex].text
                  : wird.sections[0]?.text || wird.fullText.slice(0, 350);
                onExportImage(wird, textToExport);
              }}
              className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100"
              title="تصدير كبطاقة صورة جميلة"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>صورة</span>
            </button>

            {recitationMode === 'interactive' && (
              <button
                onClick={handleResetWirdRecitation}
                className="flex items-center gap-1 text-xs font-bold px-2.5 py-2 rounded-xl text-stone-500 hover:text-stone-700"
                title="إعادة تصفير العداد"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>تصفير</span>
              </button>
            )}
          </div>

          <button
            onClick={(e) => onAddToDaily(wird, e)}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>إضافة لجدول وردي اليومي</span>
          </button>
        </div>
      </div>
    </div>
  );
};