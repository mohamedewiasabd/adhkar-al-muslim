import { triggerHaptic } from './audio';

/** ينسخ النص إلى الحافظة ويعيد وعد نجاحه (أو لا شيء إن كانت الحافظة غير متاحة). */
export function copyShareText(text: string): Promise<boolean> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text).then(() => true, () => false);
  }
  return Promise.resolve(false);
}

export function shareViaWhatsApp(text: string): void {
  triggerHaptic(20);
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function shareViaTelegram(text: string): void {
  triggerHaptic(20);
  const url = `https://t.me/share/url?url=&text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function shareViaTwitter(text: string, fallbackText: string): void {
  triggerHaptic(20);
  let tweetText = text;
  if (tweetText.length > 270) {
    tweetText = fallbackText;
  }
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function shareViaLine(text: string): void {
  triggerHaptic(20);
  const url = `https://social-plugins.line.me/lineit/share?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function shareViaViber(text: string): void {
  triggerHaptic(20);
  window.location.href = `viber://forward?text=${encodeURIComponent(text)}`;
}

export function shareViaPinterest(text: string): void {
  triggerHaptic(20);
  const url = `https://www.pinterest.com/pin/create/button/?description=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function shareViaEmail(title: string, text: string): void {
  triggerHaptic(20);
  const subject = encodeURIComponent(`شارك: ${title}`);
  const body = encodeURIComponent(text);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

export function shareViaSms(text: string): void {
  triggerHaptic(20);
  window.location.href = `sms:?body=${encodeURIComponent(text)}`;
}

/**
 * المشاركة عبر حوار النظام؛ إن لم تتوفر تعود إلى النسخ وتعرض true
 * ليُعلم المتصل المستخدم بأن النص نُسخ عبر خاصية النسخ الاعتيادية.
 */
export async function nativeShare(title: string, text: string): Promise<boolean> {
  triggerHaptic(20);
  if (navigator.share) {
    try {
      await navigator.share({ title, text });
      return false;
    } catch {
      // User cancelled or share failed
      return false;
    }
  }
  return copyShareText(text);
}