export type AspectRatioMode = '1:1' | '9:16' | '4:5' | '3:4' | '16:9';
export type ExportFormat = 'png' | 'jpeg' | 'webp';

export type ThemePreset =
  | 'emerald'
  | 'gold_dark'
  | 'midnight'
  | 'parchment'
  | 'rose_warm'
  | 'night_sky'
  | 'lavender';

export interface CardTheme {
  name: string;
  bgGradient: [string, string, string];
  textColor: string;
  subColor: string;
  accentColor: string;
  borderColor: string;
  ornamentColor: string;
  badgeBg: string;
}

export const CARD_THEMES: Record<ThemePreset, CardTheme> = {
  emerald: {
    name: 'زمردي روحاني',
    bgGradient: ['#064e3b', '#022c22', '#064e3b'],
    textColor: '#f0fdf4',
    subColor: '#a7f3d0',
    accentColor: '#34d399',
    borderColor: '#059669',
    ornamentColor: '#10b981',
    badgeBg: 'rgba(52, 211, 153, 0.15)'
  },
  gold_dark: {
    name: 'كعبة وذهب',
    bgGradient: ['#1c1917', '#0c0a09', '#1c1917'],
    textColor: '#fef3c7',
    subColor: '#fde68a',
    accentColor: '#f59e0b',
    borderColor: '#d97706',
    ornamentColor: '#fbbf24',
    badgeBg: 'rgba(245, 158, 11, 0.18)'
  },
  midnight: {
    name: 'ليل ساجٍ',
    bgGradient: ['#0f172a', '#020617', '#0f172a'],
    textColor: '#f8fafc',
    subColor: '#94a3b8',
    accentColor: '#38bdf8',
    borderColor: '#0284c7',
    ornamentColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.15)'
  },
  parchment: {
    name: 'مخطوطة عتيقة',
    bgGradient: ['#fef3c7', '#fde68a', '#fef3c7'],
    textColor: '#292524',
    subColor: '#78716c',
    accentColor: '#b45309',
    borderColor: '#d97706',
    ornamentColor: '#92400e',
    badgeBg: 'rgba(180, 83, 9, 0.12)'
  },
  rose_warm: {
    name: 'سكينة الفجر',
    bgGradient: ['#4c0519', '#1f020a', '#4c0519'],
    textColor: '#fff1f2',
    subColor: '#fecdd3',
    accentColor: '#fb7185',
    borderColor: '#e11d48',
    ornamentColor: '#f43f5e',
    badgeBg: 'rgba(251, 113, 133, 0.16)'
  },
  night_sky: {
    name: 'سماء ليلية',
    bgGradient: ['#1e1b4b', '#0f0b2e', '#1e1b4b'],
    textColor: '#f5f3ff',
    subColor: '#c7d2fe',
    accentColor: '#a78bfa',
    borderColor: '#7c3aed',
    ornamentColor: '#818cf8',
    badgeBg: 'rgba(167, 139, 250, 0.18)'
  },
  lavender: {
    name: 'سحر اللافندر',
    bgGradient: ['#5b21b6', '#3b0764', '#5b21b6'],
    textColor: '#faf5ff',
    subColor: '#e9d5ff',
    accentColor: '#c084fc',
    borderColor: '#a855f7',
    ornamentColor: '#d8b4fe',
    badgeBg: 'rgba(192, 132, 252, 0.2)'
  }
};

export const THEME_PRESETS = Object.keys(CARD_THEMES) as ThemePreset[];