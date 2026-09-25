import React, { useRef, useState, useEffect } from 'react';
import { X, Sparkles, Type, Image as ImageIcon, Film } from 'lucide-react';
import { triggerHaptic } from '../utils/audio';
import { saveMediaBlob, shareMediaBlob, canvasToBlob, handleSaveOutcome } from '../utils/imageExport';
import { renderAyahCanvas, AyahThemePreset } from '../utils/ayahCanvas';
import type { AyahExportData } from '../utils/ayahCanvas';
import { AyahThemePicker } from './imageCard/AyahThemePicker';
import { AyahExportActions } from './imageCard/AyahExportActions';

export type { AyahExportData };

interface AyahImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  ayahData: AyahExportData | null;
  onSwitchToVideo?: () => void;
}

export const AyahImageModal: React.FC<AyahImageModalProps> = ({
  isOpen,
  onClose,
  ayahData,
  onSwitchToVideo
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [theme, setTheme] = useState<AyahThemePreset>('emerald');
  const [fontSize, setFontSize] = useState<number>(30);
  const [includeBasmalah, setIncludeBasmalah] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !ayahData || !canvasRef.current) return;
    renderAyahCanvas(canvasRef.current, ayahData, theme, fontSize, includeBasmalah);
  }, [isOpen, ayahData, theme, fontSize, includeBasmalah]);

  if (!isOpen || !ayahData) return null;

  const handleDownload = async () => {
    triggerHaptic(25);
    setIsExporting(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const blob = await canvasToBlob(canvas, 'image/png', 1.0);
      const result = await saveMediaBlob(blob, `Ayah-${ayahData.surahName}-${ayahData.ayahNumber}`);
      if (result === 'failed') await handleSaveOutcome(result, 'الصورة');
    } catch {
      alert('تعذّر تصدير الصورة.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    triggerHaptic(20);
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await canvasToBlob(canvas, 'image/png', 1.0);
      await shareMediaBlob(
        blob,
        `Ayah-${ayahData.surahName}-${ayahData.ayahNumber}`,
        `سورة ${ayahData.surahName} - آية ${ayahData.ayahNumber}`,
        `﴿ ${ayahData.ayahText} ﴾ [سورة ${ayahData.surahName}: ${ayahData.ayahNumber}]`
      );
    } catch {
      // User cancelled or failed
    }
  };

  const handleCopyText = async () => {
    triggerHaptic(20);
    const formatted = `﴿ ${ayahData.ayahText} ﴾\n[سورة ${ayahData.surahName}: ${ayahData.ayahNumber}]`;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 relative max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                تصدير الآية في صورة جميلة
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                سورة {ayahData.surahName} • الآية ({ayahData.ayahNumber})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onSwitchToVideo && (
              <button
                onClick={onSwitchToVideo}
                className="text-xs px-2.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                title="تصدير هذه الآية كفيديو متحرك مع الصوت"
              >
                <Film className="w-3.5 h-3.5" />
                <span>فيديو بالصوت</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
          {/* Canvas Live Preview */}
          <div className="flex justify-center bg-stone-100 dark:bg-stone-950 p-2.5 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              className="w-full max-w-[280px] sm:max-w-[320px] aspect-[4/5] rounded-xl shadow-lg border border-black/10 object-contain"
            />
          </div>

          {/* Theme Palette Picker */}
          <AyahThemePicker theme={theme} onSelect={setTheme} />

          {/* Controls: Font size & Basmalah */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 dark:bg-stone-800/40 p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                <span className="flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-emerald-600" />
                  <span>حجم خط الآية:</span>
                </span>
                <span className="text-emerald-600 font-bold">{fontSize}</span>
              </div>
              <input
                type="range"
                min="20"
                max="44"
                step="2"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700 dark:text-stone-300">
                <input
                  type="checkbox"
                  checked={includeBasmalah}
                  onChange={(e) => setIncludeBasmalah(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>إظهار البسملة في الترويسة</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <AyahExportActions
          copied={copied}
          isExporting={isExporting}
          onCopy={handleCopyText}
          onShare={handleShare}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
};