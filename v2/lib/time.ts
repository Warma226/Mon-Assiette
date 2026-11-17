import type { Category, Dish } from '@/lib/data';

export const DEFAULT_TZ = 'Africa/Ouagadougou';

// Heure et date locales dans le fuseau de l'utilisateur (cahier §5.1)
export function localNow(tz = DEFAULT_TZ, at = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('fr-FR', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  );
  const hour = Number(parts.hour) % 24;
  return {
    hour,
    label: `${parts.weekday} ${parts.day} ${parts.month}`,
    time: `${String(hour).padStart(2, '0')}:${parts.minute}`,
    isoDay: new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(at),
  };
}

export function greeting(hour: number) {
  if (hour < 5) return 'Bonne nuit';
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

export function currentCategory(categories: Category[], hour: number): Category | null {
  if (!categories.length) return null;
  const sorted = [...categories].sort((a, b) => a.start_hour - b.start_hour);
  let cur = sorted[sorted.length - 1];
  for (const c of sorted) if (hour >= c.start_hour) cur = c;
  if (hour < sorted[0].start_hour) cur = sorted[sorted.length - 1];
  return cur;
}

// Choix déterministe : même suggestion pour un même jour, « Autre idée » avance dans la liste.
export function suggest(dishes: Dish[], category: string, allergies: string[], seed: string, skip = 0) {
  const ok = dishes.filter((d) => (d.moments.includes(category) || d.category_id === category) && !d.allergens.some((a) => allergies.includes(a)));
  const pool = ok.length ? ok : dishes.filter((d) => !d.allergens.some((a) => allergies.includes(a)));
  if (!pool.length) return null;
  // Les plats illustrés passent d'abord : la suggestion principale doit montrer le plat (cahier §5.1)
  const withPhoto = pool.filter((d) => d.image_url);
  if (withPhoto.length && skip < withPhoto.length) pool.splice(0, pool.length, ...withPhoto);
  let h = 0;
  for (const ch of seed + category) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return pool[(h + skip) % pool.length];
}
