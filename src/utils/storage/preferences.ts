import { TasbeehItem } from '../../types';
import { KEYS } from './keys';

export function loadFontSize(): 'small' | 'medium' | 'large' {
  try {
    const saved = localStorage.getItem(KEYS.FONT_SIZE);
    if (saved === 'small' || saved === 'medium' || saved === 'large') {
      return saved;
    }
    return 'medium';
  } catch {
    return 'medium';
  }
}

export function saveFontSize(size: 'small' | 'medium' | 'large'): void {
  try {
    localStorage.setItem(KEYS.FONT_SIZE, size);
  } catch {
    // ignore
  }
}

export function loadCustomTasbeeh(): TasbeehItem[] {
  try {
    const saved = localStorage.getItem(KEYS.CUSTOM_TASBEEH);
    if (!saved) return [];
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveCustomTasbeeh(items: TasbeehItem[]): void {
  try {
    localStorage.setItem(KEYS.CUSTOM_TASBEEH, JSON.stringify(items));
  } catch {
    // ignore
  }
}