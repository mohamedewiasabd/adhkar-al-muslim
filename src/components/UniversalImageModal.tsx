import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { triggerHaptic } from '../utils/audio';
import { saveMediaBlob, shareMediaBlob, canvasToBlob, handleSaveOutcome } from '../utils/imageExport';
import { CARD_THEMES, AspectRatioMode, ExportFormat, ThemePreset } from '../utils/cardThemes';
import { getCardDimensions, renderDhikrCard, DhikrCardConfig } from '../utils/cardCanvas';
import { CardControls } from './imageCard/CardControls';

export interface CardExportData {
  title: string;
  categoryLabel?: string;
  text: string;
  fadlOrBenefit?: string;
  reference?: string;
  type?: 'dhikr' | 'dua' | 'wird' | 'quran';
}

interface UniversalImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CardExportData | null;
}

export const UniversalImageModal: React.FC<UniversalImageModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Customization States
  const [theme, setTheme] = useState<ThemePreset>('emerald');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>('1:1');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [fontSize, setFontSize] = useState<number>(30); // 22 to 38
  const [includeBenefit, setIncludeBenefit] = useState<boolean>(true);
  const [includeReference, setIncludeReference] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const cardConfig: DhikrCardConfig = useMemo(
    () => ({
      theme: CARD_THEMES[theme],
      aspectRatio,
      fontSize,
      includeBenefit,
      includeReference
    }),
    [theme, aspectRatio, fontSize, includeBenefit, includeReference]
  );

  // Re-render canvas whenever dependencies change
  useEffect(() => {
    if (isOpen && data && canvasRef.current) {
      renderDhikrCard(canvasRef.current, data, cardConfig);
    }
  }, [isOpen, data, cardConfig]);

  // Download card as selected format (native save to gallery on Android)
  const handleDownloadImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    triggerHaptic(25);
    setIsExporting(true);

    try {
      const mime = exportFormat === 'png' ? 'image/png' : exportFormat === 'jpeg' ? 'image/jpeg' : 'image/webp';
      const quality = exportFormat === 'png' ? 1.0 : 0.95;
      const blob = await canvasToBlob(canvas, mime, quality);
      const safeTitle = (data.title || 'dhikr').replace(/[\\/:*?"<>|]/g, '-').slice(0, 30);
      const result = await saveMediaBlob(blob, `Athkar-${safeTitle}`);
      if (result === 'failed') await handleSaveOutcome(result, 'البطاقة');
    } catch {
      alert('تعذّر تصدير البطاقة.');
    } finally {
      setIsExporting(false);
    }
  };

  // Share card via native share sheet
  const handleShareImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    triggerHaptic(25);
    setIsExporting(true);

    try {
      const mime = exportFormat === 'png' ? 'image/png' : exportFormat === 'jpeg' ? 'image/jpeg' : 'image/webp';
      const quality = exportFormat === 'png' ? 1.0 : 0.95;
      const blob = await canvasToBlob(canvas, mime, quality);
      const safeTitle = (data.title || 'dhikr').replace(/[\\/:*?"<>|]/g, '-').slice(0, 30);
      await shareMediaBlob(
        blob,
        `Athkar-${safeTitle}`,
        data.title,
        `${data.text}\n\nتطبيق أذكار المسلم - الورد اليومي`
      );
    } catch {
      // User cancelled or failed
    } finally {
      setIsExporting(false);
    }
  };

  // Copy text to clipboard
  const handleCopyText = () => {
    if (!data) return;
    triggerHaptic(20);
    const full = [
      `🌿 ${data.title} 🌿`,
      '',
      `« ${data.text} »`,
      data.fadlOrBenefit ? `✨ الفضل: ${data.fadlOrBenefit}` : '',
      data.reference ? `📖 المصدر: ${data.reference}` : '',
      '',
      '📱 تطبيق أذكار المسلم - الورد اليومي'
    ].filter(Boolean).join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(full).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (!isOpen || !data) return null;

  const { width, height } = getCardDimensions(aspectRatio);

  const canvasAspectClass =
    aspectRatio === '9:16'
      ? 'aspect-[9/16] w-auto max-w-[200px]'
      : aspectRatio === '4:5'
      ? 'aspect-[4/5] w-auto max-w-[240px]'
      : aspectRatio === '3:4'
      ? 'aspect-[3/4] w-auto max-w-[240px]'
      : aspectRatio === '16:9'
      ? 'aspect-[16/9] w-auto max-w-[320px]'
      : 'aspect-square w-auto max-w-[270px]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div
        id="universal-image-modal-container"
        className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 relative max-h-[94vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>تصدير كبطاقة صورة جميلة</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                  {exportFormat.toUpperCase()} عالي الدقة
                </span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                {data.categoryLabel ? `${data.categoryLabel}: ` : ''}{data.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">

          {/* Canvas Live Preview */}
          <div className="flex flex-col items-center justify-center bg-stone-100 dark:bg-stone-950 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className={`rounded-xl shadow-lg border border-black/10 object-contain max-h-[300px] sm:max-h-[320px] transition-all ${canvasAspectClass}`}
            />
            <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-2">
              معاينة فورية للبطاقة قبل الحفظ أو المشاركة
            </span>
          </div>

          {/* Controls Grid */}
          <CardControls
            theme={theme}
            onThemeChange={setTheme}
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
            exportFormat={exportFormat}
            onExportFormatChange={setExportFormat}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            includeBenefit={includeBenefit}
            onIncludeBenefitChange={setIncludeBenefit}
            includeReference={includeReference}
            onIncludeReferenceChange={setIncludeReference}
            hasBenefit={Boolean(data.fadlOrBenefit)}
            hasReference={Boolean(data.reference)}
          />
        </div>

        {/* Modal Actions Footer */}
        <div className="pt-3.5 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-2 justify-between">
          <button
            type="button"
            onClick={handleCopyText}
            className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              copied
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم نسخ النص!' : 'نسخ النص'}</span>
          </button>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
            <button
              type="button"
              onClick={handleShareImage}
              disabled={isExporting}
              className="flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة البطاقة</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تحميل الصورة HD</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};