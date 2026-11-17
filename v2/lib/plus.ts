import type { SupabaseClient } from '@supabase/supabase-js';
import { getSession, isPlus } from '@/lib/data';
import { addDays, weekStart } from '@/lib/week';

export const SHELVES: Record<string, string> = { cereales: 'Céréales et féculents', legumes: 'Légumes et feuilles', fruits: 'Fruits', viandes: 'Viandes et poissons', epicerie: 'Épicerie' };
export const MEALS = ['petit_dejeuner', 'collation', 'dejeuner', 'gouter', 'diner'] as const;

// Session + statut Plus (l'équipe a accès à tout pour tester)
export async function plusSession() {
  const s = await getSession();
  let staff = false;
  if (s.user) {
    const { data } = await s.supabase.from('ma2_admin_roles').select('role').eq('user_id', s.user.id).maybeSingle();
    staff = !!data;
  }
  return { ...s, plus: isPlus(s.profile) || staff };
}

type PoolDish = { id: string; name: string; category_id: string; moments: string[]; allergens: string[]; tags: string[]; ings: { id: string; shelf: string | null }[] };

// Catalogue utilisable pour composer un planning, filtré selon le foyer
export async function loadPool(supabase: SupabaseClient, userId: string, allergies: string[], prefs: string[]) {
  const [{ data: dishes }, { data: members }, { data: avail }] = await Promise.all([
    supabase.from('ma2_dishes').select('id, name, category_id, moments, allergens, tags, di:ma2_dish_ingredients(ingredient:ma2_ingredients(id, shelf))').eq('status', 'publie'),
    supabase.from('ma2_household_members').select('allergies').eq('user_id', userId),
    supabase.from('ma2_available_ingredients').select('ingredient_id').eq('user_id', userId),
  ]);
  const all = new Set([...allergies, ...(members ?? []).flatMap((m) => m.allergies as string[])]);
  const vege = prefs.includes('vegetarien');
  const have = new Set((avail ?? []).map((a) => a.ingredient_id as string));
  type Row = { id: string; name: string; category_id: string; moments: string[]; allergens: string[]; tags: string[]; di: { ingredient: { id: string; shelf: string | null } | null }[] };
  const pool: PoolDish[] = ((dishes ?? []) as unknown as Row[])
    .map((d) => ({ ...d, ings: d.di.map((x) => x.ingredient).filter(Boolean) as { id: string; shelf: string | null }[] }))
    .filter((d) => !d.allergens.some((a) => all.has(a)))
    .filter((d) => !vege || !d.ings.some((i) => i.shelf === 'viandes'));
  return { pool, have, preferLocal: prefs.includes('plats_locaux') };
}

// Choisit un plat par moment pour chaque jour, sans répéter un plat dans la semaine si possible,
// en privilégiant ce que l'utilisateur a déjà à la maison.
export function compose(pool: PoolDish[], have: Set<string>, preferLocal: boolean, days: string[], taken: Set<string>, filled: Set<string>, seed: string) {
  const out: { day: string; category_id: string; dish_id: string }[] = [];
  const used = new Map<string, number>();
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const rnd = () => ((h = (h * 1103515245 + 12345) >>> 0) % 1000) / 1000;
  for (const day of days) {
    for (const cat of MEALS) {
      if (filled.has(`${day}|${cat}`)) continue;
      const cands = pool.filter((d) => d.category_id === cat || d.moments.includes(cat));
      if (!cands.length) continue;
      const scored = cands
        .map((d) => {
          const n = (used.get(d.id) ?? 0) + (taken.has(d.id) ? 1 : 0);
          const athome = d.ings.length ? d.ings.filter((i) => have.has(i.id)).length / d.ings.length : 0;
          const local = preferLocal && d.tags.includes('local') ? 0.5 : 0;
          return { d, s: -n * 3 + athome * 2 + local + rnd() };
        })
        .sort((a, b) => b.s - a.s);
      const pick = scored[0].d;
      used.set(pick.id, (used.get(pick.id) ?? 0) + 1);
      out.push({ day, category_id: cat, dish_id: pick.id });
    }
  }
  return out;
}

export async function ensurePlan(supabase: SupabaseClient, userId: string, ws: string) {
  const { data } = await supabase.from('ma2_meal_plans').select('id').eq('user_id', userId).eq('week_start', ws).maybeSingle();
  if (data) return data.id as string;
  const r = await supabase.from('ma2_meal_plans').insert({ user_id: userId, week_start: ws }).select('id').single();
  if (r.data) return r.data.id as string;
  const again = await supabase.from('ma2_meal_plans').select('id').eq('user_id', userId).eq('week_start', ws).single();
  return again.data!.id as string;
}

export function weekDays(day: string) {
  const ws = weekStart(day);
  return { ws, days: Array.from({ length: 7 }, (_, i) => addDays(ws, i)) };
}
