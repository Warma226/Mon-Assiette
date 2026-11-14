// Horloge de l'app : l'heure du pays choisi, pas celle du téléphone.
// now() renvoie une Date dont getHours(), getDate()… donnent l'heure murale du fuseau choisi.

let TZ = null;
export function setTZ(tz) { TZ = tz || null; }
export function getTZ() { return TZ; }

export function wallClock(tz, at = new Date()) {
  if (!tz) return new Date(at);
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(at);
    const g = (t) => Number((parts.find((p) => p.type === t) || {}).value);
    return new Date(g('year'), g('month') - 1, g('day'), g('hour') % 24, g('minute'), g('second'));
  } catch (e) { return new Date(at); }
}
export const now = () => wallClock(TZ);
export const hhmm = (d) => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
