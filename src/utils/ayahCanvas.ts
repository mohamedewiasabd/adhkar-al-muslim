export interface AyahExportData {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  ayahText: string;
}

export type AyahThemePreset = 'emerald' | 'gold_dark' | 'midnight' | 'parchment' | 'rose_warm';

export interface AyahTheme {
  name: string;
  bgGradient: [string, string, string];
  textColor: string;
  subColor: string;
  accentColor: string;
  borderColor: string;
  ornamentColor: string;
}

export const AYAH_THEMES: Record<AyahThemePreset, AyahTheme> = {
  emerald: {
    name: 'زمردي روحاني',
    bgGradient: ['#064e3b', '#022c22', '#064e3b'],
    textColor: '#f0fdf4',
    subColor: '#a7f3d0',
    accentColor: '#34d399',
    borderColor: '#059669',
    ornamentColor: '#10b981'
  },
  gold_dark: {
    name: 'كعبة وذهب',
    bgGradient: ['#1c1917', '#0c0a09', '#1c1917'],
    textColor: '#fef3c7',
    subColor: '#fde68a',
    accentColor: '#f59e0b',
    borderColor: '#d97706',
    ornamentColor: '#b45309'
  },
  midnight: {
    name: 'ليل ساجٍ',
    bgGradient: ['#0f172a', '#020617', '#0f172a'],
    textColor: '#f8fafc',
    subColor: '#94a3b8',
    accentColor: '#38bdf8',
    borderColor: '#0284c7',
    ornamentColor: '#0ea5e9'
  },
  parchment: {
    name: 'مخطوطة عتيقة',
    bgGradient: ['#fef3c7', '#fde68a', '#fef3c7'],
    textColor: '#292524',
    subColor: '#78716c',
    accentColor: '#b45309',
    borderColor: '#d97706',
    ornamentColor: '#b45309'
  },
  rose_warm: {
    name: 'سكينة الفجر',
    bgGradient: ['#4c0519', '#1f020a', '#4c0519'],
    textColor: '#fff1f2',
    subColor: '#fecdd3',
    accentColor: '#fb7185',
    borderColor: '#e11d48',
    ornamentColor: '#f43f5e'
  }
};

export function renderAyahCanvas(
  canvas: HTMLCanvasElement,
  ayahData: AyahExportData,
  theme: AyahThemePreset,
  fontSize: number,
  includeBasmalah: boolean
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const currentTheme = AYAH_THEMES[theme];

  const width = 1080;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, currentTheme.bgGradient[0]);
  grad.addColorStop(0.5, currentTheme.bgGradient[1]);
  grad.addColorStop(1, currentTheme.bgGradient[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = currentTheme.borderColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  ctx.strokeStyle = currentTheme.ornamentColor;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(55, 55, width - 110, height - 110);

  const drawCorner = (x: number, y: number, angle: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = currentTheme.accentColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-25, 0);
    ctx.lineTo(0, 0);
    ctx.lineTo(0, -25);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fillStyle = currentTheme.accentColor;
    ctx.fill();
    ctx.restore();
  };

  drawCorner(55, 55, 0);
  drawCorner(width - 55, 55, Math.PI / 2);
  drawCorner(width - 55, height - 55, Math.PI);
  drawCorner(55, height - 55, -Math.PI / 2);

  ctx.textAlign = 'center';
  ctx.fillStyle = currentTheme.subColor;
  ctx.font = '600 24px "Cairo", sans-serif';
  ctx.fillText('أَذْكَارُ الْمُسْلِمِ • الْمُصْحَفُ الشَّرِيفُ', width / 2, 110);

  ctx.fillStyle = currentTheme.accentColor + '25';
  const badgeWidth = 440;
  const badgeHeight = 60;
  const badgeX = (width - badgeWidth) / 2;
  const badgeY = 145;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 30);
  ctx.fill();
  ctx.strokeStyle = currentTheme.accentColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = currentTheme.textColor;
  ctx.font = '700 28px "Amiri", "Cairo", serif';
  ctx.fillText(`سُورَةُ ${ayahData.surahName} • الْآيَةُ (${ayahData.ayahNumber})`, width / 2, 185);

  let contentStartY = 280;
  if (includeBasmalah && ayahData.surahNumber !== 9 && ayahData.surahNumber !== 1) {
    ctx.fillStyle = currentTheme.subColor;
    ctx.font = '700 32px "Amiri", serif';
    ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', width / 2, 255);
    contentStartY = 330;
  }

  ctx.fillStyle = currentTheme.textColor;
  const ayahFontSize = Math.round((fontSize / 30) * 44);
  ctx.font = `bold ${ayahFontSize}px "Amiri", "Scheherazade New", serif`;
  ctx.textBaseline = 'middle';

  const maxLineWidth = width - 220;
  const fullText = `﴿ ${ayahData.ayahText} ﴾`;
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
  if (currentLine) {
    lines.push(currentLine);
  }

  const lineHeight = ayahFontSize * 1.8;
  const totalContentHeight = lines.length * lineHeight;
  const availableHeight = height - contentStartY - 240;
  let startY = contentStartY + (availableHeight - totalContentHeight) / 2;
  if (startY < contentStartY) startY = contentStartY;

  lines.forEach((line, idx) => {
    ctx.fillText(line, width / 2, startY + (idx * lineHeight));
  });

  const footerDividerY = height - 160;
  ctx.strokeStyle = currentTheme.borderColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(140, footerDividerY);
  ctx.lineTo(width - 140, footerDividerY);
  ctx.stroke();

  ctx.fillStyle = currentTheme.accentColor;
  ctx.font = '700 24px "Amiri", serif';
  ctx.fillText('۞', width / 2, footerDividerY);

  ctx.fillStyle = currentTheme.subColor;
  ctx.font = '500 22px "Cairo", sans-serif';
  ctx.fillText('﴿وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا﴾', width / 2, height - 110);

  ctx.fillStyle = currentTheme.subColor + '99';
  ctx.font = '400 18px "Cairo", sans-serif';
  ctx.fillText('صَدَقَةٌ جَارِيَةٌ • تَطْبِيقُ أذكارِ المسْلِمِ والوِرْدِ اليَوْمِيِّ', width / 2, height - 75);
}