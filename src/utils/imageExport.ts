import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { isAndroidPlatform } from './platform';
import nativePlugin from './nativePlugin';

/**
 * تصدير/مشاركة الصور والفيديوهات عبر المنظومة الأصلية:
 *  - الحفظ في معرض الوسائط (MediaStore) عبر المكوّن الأصلي GallerySaver (أندرويد).
 *  - المشاركة عبر نافذة المشاركة الأصلية (Share Sheet) على أندرويد و iOS.
 *  - عند تشغيل المتصفح نستخدم التنزيل العادي.
 *
 * كان التصدير سابقاً يقتصر على `a.download` لنمط data: و Web Share API
 * وهو ما يتجاهله WebView أندرويد تماماً → حلّي الأمر جذرياً هنا.
 */

export type ExportResult = 'shared' | 'saved' | 'failed';

const isNative = (): boolean => Capacitor.isNativePlatform();

const gallerySaver = nativePlugin('GallerySaver');

export interface GalleryStatus {
  needsStoragePermission: boolean;
  hasStoragePermission: boolean;
}

/** هل يحتاج جهاز المستخدم إذن تخزين (أندرويد 9 فما دون) لحفظ الملفات؟ */
export async function getGalleryStatus(): Promise<GalleryStatus | null> {
  if (!isAndroidPlatform || !gallerySaver.available()) return null;
  try {
    return await gallerySaver.call<GalleryStatus>('getStatus');
  } catch {
    return null;
  }
}

/** يفتح صفحة إعدادات التطبيق ليُفعّل المستخدم إذن التخزين. */
export async function openStorageSettings(): Promise<void> {
  if (!isAndroidPlatform || !gallerySaver.available()) return;
  try {
    await gallerySaver.call('openSettings');
  } catch {
    // تجاهل — فتح الإعدادات غير حاسم
  }
}

/**
 * يعرض الرسالة المناسبة بعد محاولة الحفظ:
 *  - عند فقدان إذن التخزين (أندرويد 9 فما دون) يطلب من المستخدم فتح الإعدادات.
 *  - في الحالات الأخرى يرشده إلى المشاركة كبديل.
 */
export async function handleSaveOutcome(result: ExportResult, thing: string): Promise<void> {
  if (result === 'saved') return;
  if (result === 'shared') return;
  const status = await getGalleryStatus();
  if (status?.needsStoragePermission && !status?.hasStoragePermission) {
    alert(`لحفظ ${thing} تحتاج منح التطبيق إذن التخزين.\nاضغط «موافق» لفتح الإعدادات، ثم فعّل الإذن وعُد للتطبيق وحاول مجدداً.`);
    await openStorageSettings();
  } else {
    alert(`تعذّر حفظ ${thing}. جرّب «مشاركة» بدلاً من ذلك.`);
  }
}

export function extForMime(mime: string): string {
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'video/mp4') return 'mp4';
  if (mime === 'video/webm') return 'webm';
  if (mime === 'image/gif') return 'gif';
  return 'png';
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.indexOf(',') >= 0 ? result.split(',')[1] : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function canvasToBlob(canvas: HTMLCanvasElement, mime = 'image/png', quality = 0.95): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob غير مدعوم'))), mime, quality);
  });
}

/** تنزيل في المتصفح (حالة متصفح فقط). */
function webDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 8000);
}

/** الكتابة في الذاكرة المؤقتة ثم فتح نافذة المشاركة الأصلية. */
async function writeCacheAndShare(blob: Blob, filename: string, title: string, text?: string): Promise<ExportResult> {
  if (!isNative()) {
    webDownload(blob, filename);
    return 'saved';
  }
  const base64 = await blobToBase64(blob);
  const path = `exports/${Date.now()}-${filename}`;
  await Filesystem.writeFile({ path, data: base64, directory: Directory.Cache, recursive: true });
  const fileUri = await Filesystem.getUri({ path, directory: Directory.Cache });
  await Share.share({
    title,
    text: text ?? '',
    files: [fileUri.uri],
    dialogTitle: 'مشاركة الأذكار'
  });
  return 'shared';
}

/** حفظ في معرض الصور/الوسائط عبر MediaStore (المكوّن الأصلي). */
export async function saveMediaBlob(blob: Blob, baseName: string): Promise<ExportResult> {
  const mime = blob.type || 'image/png';
  const filename = `${baseName}.${extForMime(mime)}`;
  try {
    if (isNative()) {
      if (isAndroidPlatform && gallerySaver.available()) {
        const base64 = await blobToBase64(blob);
        const res = await gallerySaver.call<{ saved: boolean }>('saveMedia', { data: base64, name: filename, mime });
        return res?.saved ? 'saved' : 'failed';
      }
      // بدون المكوّن الأصلي (أو على iOS): افتح نافذة المشاركة لحفظ الملف
      return await writeCacheAndShare(blob, filename, `حفظ: ${baseName}`);
    }
    webDownload(blob, filename);
    return 'saved';
  } catch {
    return 'failed';
  }
}

/** مشاركة أي ملف (صورة/فيديو) عبر النافذة الأصلية. */
export async function shareMediaBlob(blob: Blob, baseName: string, title: string, text?: string): Promise<ExportResult> {
  const mime = blob.type || 'image/png';
  const filename = `${baseName}.${extForMime(mime)}`;
  try {
    if (isNative()) {
      return await writeCacheAndShare(blob, filename, title, text);
    }
    const file = new File([blob], filename, { type: mime });
    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ title, text: text ?? '', files: [file] });
      return 'shared';
    }
    webDownload(blob, filename);
    return 'saved';
  } catch {
    return 'failed';
  }
}