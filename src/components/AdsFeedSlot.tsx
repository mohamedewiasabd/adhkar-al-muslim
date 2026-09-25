import React, { useCallback, useEffect, useRef } from 'react';
import { adsSupported, hideNativeFeedAd, onAdsReady, showNativeFeedAd } from '../utils/ads';

interface AdsFeedSlotProps {
  template?: 'small' | 'medium';
}

/**
 * فتحة إعلان Native مدمجة داخل المحتوى.
 * تحجز مساحة رأسية وتضع الإعلان فوقها (يتبع التمرير تلقائياً عبر NativeExecutor).
 * تُطلَب مباشرة عند التحميل وتُعاد المحاولة حتى تُرسَل فعلاً (لا تُسقط قبل استعداد الإعلانات).
 */
export const AdsFeedSlot: React.FC<AdsFeedSlotProps> = ({ template = 'medium' as 'small' | 'medium' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const lastShownAt = useRef(0);
  const shownY = useRef(-1);
  const dispatched = useRef(false);

  const attempt = useCallback(() => {
    if (!ref.current) return;
    // بوابة مقاومة الـ invalid traffic: لا تُرسَل طلبات قبل مضيّ 5 ثوانٍ
    if (Date.now() - lastShownAt.current < 5000) return;
    const rect = ref.current.getBoundingClientRect();
    const docY = Math.round(rect.top + window.scrollY);
    // لا نمنع إعادة الطلب في نفس الموضع إلا بعد أن تُرسَل فعلاً (حتى لا تُسقط قبل الاستعداد)
    if (dispatched.current && Math.abs(docY - shownY.current) < 24) return;
    shownY.current = docY;
    lastShownAt.current = Date.now();
    showNativeFeedAd({
      x: Math.round(rect.left),
      y: docY,
      width: Math.round(rect.width),
      template
    }).then(ok => {
      if (ok) dispatched.current = true;
    });
  }, [template]);

  useEffect(() => {
    if (!adsSupported()) return;
    const raf = () => window.requestAnimationFrame(() => attempt());
    const unsub = onAdsReady(() => window.setTimeout(() => attempt(), 0));
    window.addEventListener('scroll', raf, { passive: true });
    window.addEventListener('resize', raf);
    attempt();
    const t1 = window.setTimeout(() => attempt(), 1200);
    const t2 = window.setTimeout(() => attempt(), 6000);
    const t3 = window.setTimeout(() => attempt(), 14000);
    return () => {
      window.removeEventListener('scroll', raf);
      window.removeEventListener('resize', raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      unsub();
      hideNativeFeedAd();
    };
  }, [attempt]);

  if (!adsSupported()) return null;

  return (
    <div
      ref={ref}
      id="ads-feed-slot"
      className="w-full my-3"
      style={{ height: template === 'medium' ? 360 : 150 }}
      aria-hidden="true"
    />
  );
};

export default AdsFeedSlot;