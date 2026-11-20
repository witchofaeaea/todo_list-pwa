// Son tarih yardımcıları. Tarihler "YYYY-AA-GG" metni olarak, yerel saate göre tutulur
// (saat dilimi kayması olmasın diye Date nesnesi saklanmaz).

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

export function isDateString(value) {
  return typeof value === 'string' && DATE_PATTERN.test(value);
}

export function todayString(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parse(dateString) {
  const [y, m, d] = dateString.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Bugünden kaç gün sonra (geçmişse negatif). */
export function daysFromToday(due, today = todayString()) {
  // Yaz saati geçişlerinde gün 23/25 saat olabildiği için yuvarlanır.
  return Math.round((parse(due) - parse(today)) / DAY_MS);
}

/** Listede gösterilecek kısa etiket: "Bugün", "Yarın", "25 Kas" gibi. */
export function describeDue(due, today = todayString()) {
  const diff = daysFromToday(due, today);
  let label;
  if (diff === 0) label = 'Bugün';
  else if (diff === 1) label = 'Yarın';
  else if (diff === -1) label = 'Dün';
  else {
    const date = parse(due);
    const sameYear = date.getFullYear() === parse(today).getFullYear();
    label = date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: sameYear ? undefined : 'numeric'
    });
  }
  return { label, overdue: diff < 0, isToday: diff === 0 };
}
