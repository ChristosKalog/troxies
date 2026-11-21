// Βοηθητικές συναρτήσεις για ημερομηνίες και λίστες.

const day = new Intl.DateTimeFormat('el-GR', { day: 'numeric', month: 'long', year: 'numeric' });
const dayNoYear = new Intl.DateTimeFormat('el-GR', { day: 'numeric', month: 'long' });

type DateEntry = { from?: Date; to?: Date; label?: string };

/** "18 Μαρτίου 2026" ή "25 Απριλίου – 5 Μαΐου 2026" */
export function formatRange(d: DateEntry): string {
  if (!d.from) return d.label ?? '';
  if (!d.to) return day.format(d.from);
  const sameYear = d.from.getFullYear() === d.to.getFullYear();
  return `${sameYear ? dayNoYear.format(d.from) : day.format(d.from)} – ${day.format(d.to)}`;
}

/** Έχει τελειώσει η περίοδος; */
export function isPast(d: DateEntry, now = new Date()): boolean {
  const end = d.to ?? d.from;
  if (!end) return true;
  const e = new Date(end);
  e.setHours(23, 59, 59);
  return e < now;
}

/** Μικρός σταθερός αριθμός από ένα κείμενο (για να διαφέρουν τα placeholders) */
export function seedFrom(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // τελικό "ανακάτεμα" ώστε παρόμοια κείμενα να δίνουν πολύ διαφορετικά νούμερα
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}
