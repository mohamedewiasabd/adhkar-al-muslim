import { CardExportData } from '../components/UniversalImageModal';
import { CardTheme, AspectRatioMode } from './cardThemes';

export interface DhikrCardConfig {
  theme: CardTheme;
  aspectRatio: AspectRatioMode;
  fontSize: number;
  includeBenefit: boolean;
  includeReference: boolean;
}

export const getCardDimensions = (aspectRatio: AspectRatioMode) => {
  switch (aspectRatio) {
    case '9:16':
      return { width: 720, height: 1280 };
    case '4:5':
      return { width: 800, height: 1000 };
    case '3:4':
      return { width: 720, height: 960 };
    case '16:9':
      return { width: 1280, height: 720 };
    case '1:1':
    default:
      return { width: 800, height: 800 };
  }
};

/** يرسم بطاقة الذكر/الدعاء/الورد كاملة على الكانفاس حسب الطابع والأبعاد والإعدادات. */
export const renderDhikrCard = (
  canvas: HTMLCanvasElement,
  data: CardExportData,
  config: DhikrCardConfig
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { width, height } = getCardDimensions(config.aspectRatio);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  const t = config.theme;

  // 1. Background Gradient
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, t.bgGradient[0]);
  grad.addColorStop(0.5, t.bgGradient[1]);
  grad.addColorStop(1, t.bgGradient[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Decorative subtle background pattern (Islamic geometry dots/stars)
  ctx.fillStyle = t.accentColor + '12';
  const dotSpacing = 40;
  for (let x = 30; x < width - 30; x += dotSpacing) {
    for (let y = 30; y < height - 30; y += dotSpacing) {
      if ((x + y) % (dotSpacing * 2) === 0) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 2. Ornate Double Islamic Border
  const padOuter = 34;
  const padInner = 48;
  ctx.strokeStyle = t.borderColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(padOuter, padOuter, width - padOuter * 2, height - padOuter * 2);

  ctx.strokeStyle = t.ornamentColor + '99';
  ctx.lineWidth = 1.4;
  ctx.strokeRect(padInner, padInner, width - padInner * 2, height - padInner * 2);

  // Corner Ornaments
  const drawCorner = (x: number, y: number, angle: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = t.accentColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(0, 0);
    ctx.lineTo(0, -22);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = t.accentColor;
    ctx.fill();
    ctx.restore();
  };

  drawCorner(padInner, padInner, 0);
  drawCorner(width - padInner, padInner, Math.PI / 2);
  drawCorner(width - padInner, height - padInner, Math.PI);
  drawCorner(padInner, height - padInner, -Math.PI / 2);

  // 3. Header Title & Badge
  ctx.textAlign = 'center';
  ctx.fillStyle = t.subColor;
  ctx.font = '600 18px "Cairo", sans-serif';
  ctx.fillText('أَذْكَارُ الْمُسْلِمِ • الْوِرْدُ الْيَوْمِيُّ', width / 2, config.aspectRatio === '9:16' ? 95 : 85);

  // Category / Title Badge Banner
  const badgeW = Math.min(width - 160, 480);
  const badgeH = 50;
  const badgeX = (width - badgeW) / 2;
  const badgeY = config.aspectRatio === '9:16' ? 120 : 105;

  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 25);
  ctx.fillStyle = t.badgeBg;
  ctx.fill();
  ctx.strokeStyle = t.accentColor;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  const displayHeader = data.categoryLabel
    ? `${data.categoryLabel} • ${data.title}`
    : data.title;

  ctx.fillStyle = t.textColor;
  ctx.font = '700 22px "Amiri", "Cairo", serif';
  ctx.fillText(displayHeader, width / 2, badgeY + 32);

  // 4. Middle Content: Sacred Text (Dhikr / Dua / Wird)
  const contentStartY = badgeY + badgeH + 30;
  const footerSpace = (config.includeBenefit && data.fadlOrBenefit) || (config.includeReference && data.reference) ? 170 : 110;
  const availableHeight = height - contentStartY - footerSpace;

  // Font calculation & Line wrapping
  const textBaseFontSize = Math.round((config.fontSize / 30) * (config.aspectRatio === '9:16' ? 32 : 28));
  ctx.fillStyle = t.textColor;
  ctx.font = `bold ${textBaseFontSize}px "Amiri", "Scheherazade New", serif`;
  ctx.textBaseline = 'middle';

  const maxLineWidth = width - (padInner * 2 + 60);
  const cleanText = data.text.trim();
  // Wrap with traditional quotes if not already enclosed
  const quoteText = cleanText.startsWith('«') || cleanText.startsWith('﴿') ? cleanText : `« ${cleanText} »`;

  // Line wrapping algorithm
  const words = quoteText.split(/\s+/);
  const lines: string[] = [];
  let curLine = '';

  for (let i = 0; i < words.length; i++) {
    const test = curLine ? `${curLine} ${words[i]}` : words[i];
    if (ctx.measureText(test).width > maxLineWidth && curLine) {
      lines.push(curLine);
      curLine = words[i];
    } else {
      curLine = test;
    }
  }
  if (curLine) lines.push(curLine);

  // If too many lines for available height, scale down font slightly
  const calculatedLineHeight = textBaseFontSize * 1.85;
  let blockHeight = lines.length * calculatedLineHeight;
  let effectiveLineHeight = calculatedLineHeight;
  let effectiveFontSize = textBaseFontSize;

  if (blockHeight > availableHeight) {
    const scaleFactor = Math.max(0.65, availableHeight / blockHeight);
    effectiveFontSize = Math.round(textBaseFontSize * scaleFactor);
    effectiveLineHeight = effectiveFontSize * 1.75;
    ctx.font = `bold ${effectiveFontSize}px "Amiri", "Scheherazade New", serif`;
    blockHeight = lines.length * effectiveLineHeight;
  }

  let startY = contentStartY + (availableHeight - blockHeight) / 2;
  if (startY < contentStartY) startY = contentStartY;

  lines.forEach((line, idx) => {
    ctx.fillText(line, width / 2, startY + (idx * effectiveLineHeight));
  });

  // 5. Bottom Section: Benefit (الفضل) and Reference (المصدر)
  let bottomSectionY = height - footerSpace + 10;

  // Divider Line
  ctx.strokeStyle = t.accentColor + '50';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padInner + 50, bottomSectionY);
  ctx.lineTo(width - (padInner + 50), bottomSectionY);
  ctx.stroke();

  // Small Diamond in center of divider
  ctx.fillStyle = t.accentColor;
  ctx.beginPath();
  ctx.arc(width / 2, bottomSectionY, 4, 0, Math.PI * 2);
  ctx.fill();

  bottomSectionY += 24;

  // Benefit Text
  if (config.includeBenefit && data.fadlOrBenefit) {
    ctx.fillStyle = t.accentColor;
    ctx.font = '600 15px "Cairo", sans-serif';
    const benefitText = `✨ الفضل: ${data.fadlOrBenefit}`;
    // Wrap if too long
    const bMetrics = ctx.measureText(benefitText);
    if (bMetrics.width > maxLineWidth) {
      const wordsB = benefitText.split(' ');
      let l1 = '';
      let l2 = '';
      wordsB.forEach(w => {
        if (ctx.measureText(`${l1} ${w}`).width <= maxLineWidth && !l2) {
          l1 += `${l1 ? ' ' : ''}${w}`;
        } else {
          l2 += `${l2 ? ' ' : ''}${w}`;
        }
      });
      ctx.fillText(l1, width / 2, bottomSectionY);
      bottomSectionY += 20;
      if (l2) {
        ctx.fillText(l2, width / 2, bottomSectionY);
        bottomSectionY += 20;
      }
    } else {
      ctx.fillText(benefitText, width / 2, bottomSectionY);
      bottomSectionY += 24;
    }
  }

  // Reference Text
  if (config.includeReference && data.reference) {
    ctx.fillStyle = t.subColor;
    ctx.font = '500 14px "Cairo", sans-serif';
    ctx.fillText(`📖 ${data.reference}`, width / 2, bottomSectionY);
    bottomSectionY += 22;
  }

  // Watermark / Brand Footer
  ctx.fillStyle = t.subColor + '99';
  ctx.font = '500 12px "Cairo", sans-serif';
  ctx.fillText('تَطْبِيقُ أذكارِ المسْلِمِ • الْوِرْدُ الْيَوْمِيُّ', width / 2, height - (padInner - 18));
};