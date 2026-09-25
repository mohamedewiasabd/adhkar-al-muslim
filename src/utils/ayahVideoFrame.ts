import { VideoTheme } from '../data/ayahVideoThemes';
import { VideoParticle } from './videoUtils';

export type VideoAspectRatio = '9:16' | '1:1';

export interface AyahVideoFrameInput {
  canvas: HTMLCanvasElement;
  theme: VideoTheme;
  aspectRatio: VideoAspectRatio;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  ayahText: string;
  reciterName: string;
  includeBasmalah: boolean;
  isPlayingPreview: boolean;
  isRecording: boolean;
  progressRatio: number;
  frequencyData?: Uint8Array;
  particles: VideoParticle[];
}

/**
 * يرسم لقطة من بطاقة الفيديو (خلفية، حدود، بطاقة السورة، نص الآية،
 * موجات الصوت وشريط التقدم) على لوحة الرسم — تُستدعى في كل إطار.
 */
export function drawAyahVideoFrame(input: AyahVideoFrameInput): void {
  const {
    canvas,
    theme,
    aspectRatio,
    surahName,
    surahNumber,
    ayahNumber,
    ayahText,
    reciterName,
    includeBasmalah,
    isPlayingPreview,
    isRecording,
    progressRatio,
    frequencyData,
    particles,
  } = input;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 720;
  const height = aspectRatio === '9:16' ? 1280 : 720;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  // 1. Background Gradient
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, theme.bgGradient[0]);
  grad.addColorStop(0.5, theme.bgGradient[1]);
  grad.addColorStop(1, theme.bgGradient[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Animated floating star particles
  ctx.save();
  particles.forEach(p => {
    p.y -= p.speed;
    if (p.y < 0) p.y = height;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `${theme.accentColor}${Math.floor(p.opacity * 255).toString(16).padStart(2, '0')}`;
    ctx.fill();
  });
  ctx.restore();

  // 3. Ornate Double Islamic Border
  const padOuter = 30;
  const padInner = 42;
  ctx.strokeStyle = theme.borderColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(padOuter, padOuter, width - padOuter * 2, height - padOuter * 2);

  ctx.strokeStyle = theme.accentColor + '80';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(padInner, padInner, width - padInner * 2, height - padInner * 2);

  const drawCorner = (x: number, y: number, angle: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(0, 0);
    ctx.lineTo(0, -20);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = theme.accentColor;
    ctx.fill();
    ctx.restore();
  };

  drawCorner(padInner, padInner, 0);
  drawCorner(width - padInner, padInner, Math.PI / 2);
  drawCorner(width - padInner, height - padInner, Math.PI);
  drawCorner(padInner, height - padInner, -Math.PI / 2);

  // 4. Header Badge
  ctx.textAlign = 'center';
  ctx.fillStyle = theme.subColor;
  ctx.font = '600 18px "Cairo", sans-serif';
  ctx.fillText('أَذْكَارُ الْمُسْلِمِ • الْمُصْحَفُ الشَّرِيفُ', width / 2, aspectRatio === '9:16' ? 95 : 75);

  // Surah & Reciter Pill Banner
  const badgeW = 380;
  const badgeH = 50;
  const badgeX = (width - badgeW) / 2;
  const badgeY = aspectRatio === '9:16' ? 120 : 95;

  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 25);
  ctx.fillStyle = theme.accentColor + '20';
  ctx.fill();
  ctx.strokeStyle = theme.accentColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = theme.textColor;
  ctx.font = '700 22px "Amiri", "Cairo", serif';
  ctx.fillText(`سُورَةُ ${surahName} • الْآيَةُ (${ayahNumber})`, width / 2, badgeY + 32);

  // Reciter Name Subtitle
  ctx.fillStyle = theme.subColor;
  ctx.font = '500 15px "Cairo", sans-serif';
  ctx.fillText(`بِصَوْتِ ${reciterName}`, width / 2, badgeY + badgeH + 25);

  // Basmalah (if enabled & not Tawbah/Fatiha)
  let contentTop = badgeY + badgeH + 45;
  if (includeBasmalah && surahNumber !== 9 && surahNumber !== 1) {
    ctx.fillStyle = theme.subColor;
    ctx.font = '700 24px "Amiri", serif';
    ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', width / 2, contentTop + 20);
    contentTop += 45;
  }

  // 5. Quranic Ayah Text in Center
  ctx.fillStyle = theme.textColor;
  const ayahFontSize = aspectRatio === '9:16' ? 34 : 26;
  ctx.font = `bold ${ayahFontSize}px "Amiri", "Scheherazade New", serif`;
  ctx.textBaseline = 'middle';

  const maxLineWidth = width - (padInner * 2 + 70);
  const fullText = `﴿ ${ayahText} ﴾`;
  const words = fullText.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxLineWidth && currentLine !== '') {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  const lineHeight = ayahFontSize * 1.85;
  const textBlockHeight = lines.length * lineHeight;
  const availableAreaHeight = height - contentTop - (aspectRatio === '9:16' ? 240 : 160);
  let startY = contentTop + (availableAreaHeight - textBlockHeight) / 2;
  if (startY < contentTop) startY = contentTop;

  lines.forEach((line, idx) => {
    ctx.fillText(line, width / 2, startY + (idx * lineHeight));
  });

  // 6. Audio Waveform Spectrum reacting live to audio
  const waveY = height - (aspectRatio === '9:16' ? 140 : 100);
  const waveWidth = width - 180;
  const barCount = 36;
  const barW = 4;
  const gap = (waveWidth - (barCount * barW)) / (barCount - 1);
  const startX = (width - waveWidth) / 2;

  ctx.save();
  for (let b = 0; b < barCount; b++) {
    let amp = 0.15;
    if (frequencyData && frequencyData.length > 0) {
      const freqIdx = Math.floor((b / barCount) * (frequencyData.length / 2));
      amp = Math.max(0.12, (frequencyData[freqIdx] || 0) / 255);
    } else if (isPlayingPreview || isRecording) {
      amp = 0.25 + 0.3 * Math.sin(Date.now() * 0.008 + b * 0.4);
    }

    const barHeight = Math.max(4, amp * (aspectRatio === '9:16' ? 45 : 30));
    const bx = startX + b * (barW + gap);
    const by = waveY - barHeight / 2;

    ctx.fillStyle = theme.waveColor;
    ctx.beginPath();
    ctx.roundRect(bx, by, barW, barHeight, barW / 2);
    ctx.fill();
  }
  ctx.restore();

  // 7. Time / Reading Progress Bar at the bottom
  const progressY = height - (aspectRatio === '9:16' ? 85 : 55);
  const progressWidth = width - 140;
  const px = (width - progressWidth) / 2;

  ctx.fillStyle = theme.subColor + '30';
  ctx.beginPath();
  ctx.roundRect(px, progressY, progressWidth, 4, 2);
  ctx.fill();

  const filledWidth = Math.max(0, Math.min(progressWidth, progressWidth * progressRatio));
  if (filledWidth > 0) {
    ctx.fillStyle = theme.accentColor;
    ctx.beginPath();
    ctx.roundRect(px, progressY, filledWidth, 4, 2);
    ctx.fill();
  }

  // Footer Watermark
  ctx.fillStyle = theme.subColor + '99';
  ctx.font = '500 13px "Cairo", sans-serif';
  ctx.fillText('تَطْبِيقُ أذكارِ المسْلِمِ والوِرْدِ اليَوْمِيِّ', width / 2, height - (aspectRatio === '9:16' ? 55 : 28));
}