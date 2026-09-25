export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatHM(h: number, m: number): string {
  return pad2(h) + ':' + pad2(m);
}

function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function addMinutesToHM(hhmm: string, delta: number): string {
  const total = (minutesOf(hhmm) + delta + 1440) % 1440;
  return formatHM(Math.floor(total / 60), total % 60);
}

export function dateKey(d: Date): string {
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

/** دقائق النص بصيغة HH:MM — تُستخدم داخلياً للمقارنة بين المواقيت. */
export function minutesOfHM(hhmm: string): number {
  return minutesOf(hhmm);
}