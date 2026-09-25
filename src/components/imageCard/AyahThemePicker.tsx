import React from 'react';
import { Palette } from 'lucide-react';
import { AYAH_THEMES, AyahThemePreset } from '../../utils/ayahCanvas';
import { triggerHaptic } from '../../utils/audio';

interface AyahThemePickerProps {
  theme: AyahThemePreset;
  onSelect: (theme: AyahThemePreset) => void;
}

export const AyahThemePicker: React.FC<AyahThemePickerProps> = ({ theme, onSelect }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
      <Palette className="w-3.5 h-3.5 text-emerald-600" />
      <span>اختر مظهر ولون البطاقة:</span>
    </label>
    <div className="grid grid-cols-5 gap-2">
      {(Object.keys(AYAH_THEMES) as AyahThemePreset[]).map((tKey) => {
        const isCurrent = theme === tKey;
        const t = AYAH_THEMES[tKey];
        return (
          <button
            key={tKey}
            onClick={() => {
              triggerHaptic(15);
              onSelect(tKey);
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
);