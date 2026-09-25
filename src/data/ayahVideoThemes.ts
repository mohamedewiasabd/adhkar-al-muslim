export type VideoThemePreset = 'emerald' | 'gold_dark' | 'midnight' | 'parchment' | 'rose_warm';

export interface VideoTheme {
  name: string;
  bgGradient: [string, string, string];
  textColor: string;
  subColor: string;
  accentColor: string;
  borderColor: string;
  waveColor: string;
}

export const VIDEO_THEMES: Record<VideoThemePreset, VideoTheme> = {
  emerald: {
    name: 'زمردي روحاني',
    bgGradient: ['#064e3b', '#022c22', '#064e3b'],
    textColor: '#f0fdf4',
    subColor: '#a7f3d0',
    accentColor: '#34d399',
    borderColor: '#059669',
    waveColor: '#34d399'
  },
  gold_dark: {
    name: 'كعبة وذهب',
    bgGradient: ['#1c1917', '#0c0a09', '#1c1917'],
    textColor: '#fef3c7',
    subColor: '#fde68a',
    accentColor: '#f59e0b',
    borderColor: '#d97706',
    waveColor: '#f59e0b'
  },
  midnight: {
    name: 'ليل ساجٍ',
    bgGradient: ['#0f172a', '#020617', '#0f172a'],
    textColor: '#f8fafc',
    subColor: '#94a3b8',
    accentColor: '#38bdf8',
    borderColor: '#0284c7',
    waveColor: '#38bdf8'
  },
  parchment: {
    name: 'مخطوطة عتيقة',
    bgGradient: ['#fef3c7', '#fde68a', '#fef3c7'],
    textColor: '#292524',
    subColor: '#78716c',
    accentColor: '#b45309',
    borderColor: '#d97706',
    waveColor: '#b45309'
  },
  rose_warm: {
    name: 'سكينة الفجر',
    bgGradient: ['#4c0519', '#1f020a', '#4c0519'],
    textColor: '#fff1f2',
    subColor: '#fecdd3',
    accentColor: '#fb7185',
    borderColor: '#e11d48',
    waveColor: '#fb7185'
  }
};