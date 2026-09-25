import { registerPlugin } from '@capacitor/core';
import { isAndroidPlatform } from './platform';

export interface WidgetTasbeehItem {
  text: string;
  count: number;
}

interface TasbeehWidgetsApi {
  setItems(options: { items: string }): Promise<void>;
  forceRender(): Promise<void>;
}

const TasbeehWidgets = registerPlugin<TasbeehWidgetsApi>('TasbeehWidgets');

const STORE_KEY = 'home_tasbeeh_chain_v1';

export const DEFAULT_TASBEEH_CHAIN: WidgetTasbeehItem[] = [
  { text: 'سبحان الله', count: 33 },
  { text: 'الحمد لله', count: 33 },
  { text: 'الله أكبر', count: 34 },
  { text: 'لا إله إلا الله', count: 33 },
];

export function loadTasbeehChain(): WidgetTasbeehItem[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return DEFAULT_TASBEEH_CHAIN.map(i => ({ ...i }));
    const parsed = JSON.parse(raw) as WidgetTasbeehItem[];
    if (!Array.isArray(parsed) || parsed.length === 0)
      return DEFAULT_TASBEEH_CHAIN.map(i => ({ ...i }));
    const clean = parsed
      .map((i, idx) => ({
        text: typeof i?.text === 'string' && i.text.trim() ? i.text.trim() : `ذكر ${idx + 1}`,
        count: typeof i?.count === 'number' && i.count >= 1 ? Math.round(i.count) : 33,
      }));
    return clean;
  } catch {
    return DEFAULT_TASBEEH_CHAIN.map(i => ({ ...i }));
  }
}

export function saveTasbeehChain(items: WidgetTasbeehItem[]): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

/** يدفع القائمة الحالية (أو المخصصة) إلى ودجد المسبحة على الشاشة الرئيسية. */
export async function pushTasbeehChainToWidget(items?: WidgetTasbeehItem[]): Promise<void> {
  if (!isAndroidPlatform) return;
  const chain = items ?? loadTasbeehChain();
  try {
    await TasbeehWidgets.setItems({ items: JSON.stringify(chain) });
  } catch {
    // الودجد قد لا يكون موضوعاً بعد؛ سيقرأ التفضيلات عند رسمه
  }
}

export async function forceTasbeehWidgetRender(): Promise<void> {
  if (!isAndroidPlatform) return;
  try {
    await TasbeehWidgets.forceRender();
  } catch {
    // ignore
  }
}