// Dates « locales » au format AAAA-MM-JJ, calculées sans fuseau (le jour vient de l'heure locale de l'utilisateur).
export function addDays(iso: string, n: number) {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function weekStart(iso: string) {
  const d = new Date(iso + 'T12:00:00Z');
  const dow = (d.getUTCDay() + 6) % 7; // lundi = 0
  return addDays(iso, -dow);
}

export function todayIso(tz = 'Africa/Ouagadougou') {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
}

export function dayLabel(iso: string, style: 'short' | 'long' = 'short') {
  const d = new Date(iso + 'T12:00:00Z');
  return new Intl.DateTimeFormat('fr-FR', style === 'short' ? { weekday: 'short', timeZone: 'UTC' } : { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(d);
}
