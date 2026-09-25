export interface ReciterInfo {
  id: string;
  name: string;
  folder: string;
}

export const RECITERS: ReciterInfo[] = [
  { id: 'alafasy', name: 'الشيخ مشاري راشد العفاسي', folder: 'Alafasy/mp3' },
  { id: 'minshawi', name: 'الشيخ محمد صديق المنشاوي (مرتل)', folder: 'Minshawi/Murattal/mp3' },
  { id: 'abdulbaset', name: 'الشيخ عبد الباسط عبد الصمد (مرتل)', folder: 'AbdulBaset/Murattal/mp3' },
];

/** يعيد أول صيغة فيديو مدعومة من المتصفح لأجل MediaRecorder. */
export function getSupportedVideoMimeType(): { mime: string; ext: string } {
  const types = [
    { mime: 'video/mp4;codecs=avc1,mp4a.40.2', ext: 'mp4' },
    { mime: 'video/mp4', ext: 'mp4' },
    { mime: 'video/webm;codecs=vp9,opus', ext: 'webm' },
    { mime: 'video/webm;codecs=vp8,opus', ext: 'webm' },
    { mime: 'video/webm', ext: 'webm' }
  ];
  for (const t of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t.mime)) {
      return t;
    }
  }
  return { mime: 'video/webm', ext: 'webm' };
}

export interface VideoParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

/** يولّد جزيئات النجوم العائمة في خلفية الفيديو حسب نسبة الأبعاد. */
export function makeVideoParticles(aspectRatio: '9:16' | '1:1'): VideoParticle[] {
  const particles: VideoParticle[] = [];
  const count = 35;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * 720,
      y: Math.random() * (aspectRatio === '9:16' ? 1280 : 720),
      size: Math.random() * 2.5 + 0.8,
      speed: Math.random() * 0.4 + 0.15,
      opacity: Math.random() * 0.7 + 0.2
    });
  }
  return particles;
}