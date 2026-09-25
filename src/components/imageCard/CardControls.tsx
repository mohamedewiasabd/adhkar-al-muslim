import React from 'react';
import {
  Smartphone,
  Square,
  Layers,
  Download,
  Sparkles,
  Palette,
  Type,
  Image as ImageIcon
} from 'lucide-react';
import { triggerHaptic } from '../../utils/audio';
import { CARD_THEMES, THEME_PRESETS, AspectRatioMode, ExportFormat, ThemePreset } from '../../utils/cardThemes';

interface CardControlsProps {
  theme: ThemePreset;
  onThemeChange: (theme: ThemePreset) => void;
  aspectRatio: AspectRatioMode;
  onAspectRatioChange: (ratio: AspectRatioMode) => void;
  exportFormat: ExportFormat;
  onExportFormatChange: (format: ExportFormat) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  includeBenefit: boolean;
  onIncludeBenefitChange: (value: boolean) => void;
  includeReference: boolean;
  onIncludeReferenceChange: (value: boolean) => void;
  hasBenefit: boolean;
  hasReference: boolean;
}

/** ضوابط تخصيص بطاقة الصورة: الأبعاد، التنسيق، الطابع اللوني، حجم الخط والخيارات. */
export const CardControls: React.FC<CardControlsProps> = ({
  theme,
  onThemeChange,
  aspectRatio,
  onAspectRatioChange,
  exportFormat,
  onExportFormatChange,
  fontSize,
  onFontSizeChange,
  includeBenefit,
  onIncludeBenefitChange,
  includeReference,
  onIncludeReferenceChange,
  hasBenefit,
  hasReference
}) => {
  const ratioButtons: { value: AspectRatioMode; icon: React.ReactNode; label: string }[] = [
    { value: '1:1', icon: <Square className="w-3.5 h-3.5" />, label: '1:1' },
    { value: '4:5', icon: <Layers className="w-3.5 h-3.5" />, label: '4:5' },
    { value: '3:4', icon: <Layers className="w-3.5 h-3.5" />, label: '3:4' },
    { value: '9:16', icon: <Smartphone className="w-3.5 h-3.5" />, label: '9:16' },
    { value: '16:9', icon: <Smartphone className="w-3.5 h-3.5" />, label: '16:9' }
  ];

  const formatIcons: Record<ExportFormat, React.ReactNode> = {
    png: <Square className="w-3.5 h-3.5" />,
    jpeg: <ImageIcon className="w-3.5 h-3.5" />,
    webp: <Sparkles className="w-3.5 h-3.5" />
  };

  return (
    <div className="space-y-3.5">
      {/* 1. Dimensions / Aspect Ratio */}
      <div className="bg-stone-50 dark:bg-stone-800/40 p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800">
        <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
          <span>أبعاد البطاقة:</span>
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {ratioButtons.map((btn) => (
            <button
              key={btn.value}
              type="button"
              onClick={() => {
                triggerHaptic(15);
                onAspectRatioChange(btn.value);
              }}
              className={`py-2 px-1 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                aspectRatio === btn.value
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
              }`}
            >
              {btn.icon}
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 1b. Export Format */}
      <div className="bg-stone-50 dark:bg-stone-800/40 p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800">
        <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>تنسيق الصورة:</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['png', 'jpeg', 'webp'] as ExportFormat[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                triggerHaptic(15);
                onExportFormatChange(f);
              }}
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 uppercase transition-colors cursor-pointer ${
                exportFormat === f
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
              }`}
            >
              {formatIcons[f]}
              <span>{f}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Theme Presets */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
          <Palette className="w-3.5 h-3.5 text-emerald-600" />
          <span>اختر الطابع اللوني:</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {THEME_PRESETS.map((tKey) => {
            const isCurrent = theme === tKey;
            const t = CARD_THEMES[tKey];
            return (
              <button
                key={tKey}
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  onThemeChange(tKey);
                }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-full shadow-xs border border-white/20"
                  style={{ background: `linear-gradient(135deg, ${t.bgGradient[0]}, ${t.accentColor})` }}
                />
                <span className="text-[10px] font-medium text-stone-700 dark:text-stone-300 line-clamp-1">
                  {t.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Font Size Slider & Toggles */}
      <div className="bg-stone-50 dark:bg-stone-800/40 p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-emerald-600" />
              <span>حجم الخط:</span>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
              {fontSize}px
            </span>
          </div>
          <input
            type="range"
            min="22"
            max="38"
            value={fontSize}
            onChange={(e) => onFontSizeChange(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
          {hasBenefit && (
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700 dark:text-stone-300">
              <input
                type="checkbox"
                checked={includeBenefit}
                onChange={(e) => onIncludeBenefitChange(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span>إظهار الفضل والبركة</span>
            </label>
          )}

          {hasReference && (
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700 dark:text-stone-300">
              <input
                type="checkbox"
                checked={includeReference}
                onChange={(e) => onIncludeReferenceChange(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span>إظهار المصدر والتخريج</span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
};