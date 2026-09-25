// دوال التواريخ المستخدمة يومياً (ميلادي/هجري/يوم الأسبوع).

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getIslamicDateString(): string {
  try {
    const date = new Date();
    // Use Intl DateTimeFormat with islamic-umalqura calendar
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return formatter.format(date);
  } catch {
    return 'التاريخ الهجري';
  }
}

export function getGregorianDateString(): string {
  const date = new Date();
  return new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function getFormattedDates(): { hijri: string; gregorian: string; weekday: string } {
  const date = new Date();
  let hijri = '١٤٤٦ هـ';
  try {
    const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    hijri = hijriFormatter.format(date);
  } catch {
    hijri = getIslamicDateString();
  }

  let gregorian = '';
  let weekday = '';
  try {
    weekday = new Intl.DateTimeFormat('ar-EG', { weekday: 'long' }).format(date);
    gregorian = new Intl.DateTimeFormat('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    gregorian = date.toLocaleDateString('ar-EG');
  }

  return { hijri, gregorian, weekday };
}