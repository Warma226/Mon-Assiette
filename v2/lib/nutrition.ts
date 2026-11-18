// Composition des repas selon les repères des spécialistes de la nutrition :
// - OMS, « Alimentation saine » : varier chaque jour fruits, légumes, légumineuses et céréales complètes ;
//   au moins 400 g de fruits et légumes par jour ; limiter les sucres libres, le sel et les graisses.
// - FAO, guides alimentaires nationaux (Bénin 2015, Nigeria 2001…) : chaque jour des aliments de chaque
//   groupe (énergie, construction, protection) ; céréales/tubercules et légumes à chaque repas principal.
// Les suggestions ne sont pas tirées au hasard : chaque plat reçoit une note selon ce qu'il apporte à la journée.
import type { SupabaseClient } from '@supabase/supabase-js';

export type Group = 'cereales' | 'legumineuses' | 'legumes' | 'fruits' | 'proteines' | 'laitiers' | 'matieres_grasses' | 'sucres' | 'condiments';
export type NDish = {
  id: string;
  slug: string;
  name: string;
  category_id: string;
  moments: string[];
  allergens: string[];
  tags: string[];
  is_fried: boolean;
  is_sweet: boolean;
  image_url: string | null;
  groups: Group[];
  ingredientIds: string[];
  meatShelf: boolean;
};

export const MAIN = ['dejeuner', 'diner'];
export const SNACK = ['collation', 'gouter'];

// Repères affichés à l'utilisateur pour une journée
export const DAY_GOALS: { id: string; label: string; tip: string }[] = [
  { id: 'cereales', label: 'Céréales ou tubercules', tip: 'pour l’énergie (mil, sorgho, maïs, riz, fonio, igname…)' },
  { id: 'proteines', label: 'Protéines', tip: 'légumineuses, poisson, œuf, viande ou lait' },
  { id: 'legumes', label: 'Légumes', tip: 'au moins 2 repas avec des légumes ou des feuilles' },
  { id: 'fruits', label: 'Fruit', tip: 'au moins un fruit dans la journée' },
];

const has = (d: NDish, g: Group) => d.groups.includes(g);
export const hasProtein = (d: NDish) => has(d, 'proteines') || has(d, 'legumineuses') || has(d, 'laitiers');

export async function loadNutriPool(supabase: SupabaseClient): Promise<NDish[]> {
  const { data } = await supabase
    .from('ma2_dishes')
    .select('id, slug, name, category_id, moments, allergens, tags, is_fried, is_sweet, image_url, di:ma2_dish_ingredients(is_optional, ingredient:ma2_ingredients(id, food_group, shelf))')
    .eq('status', 'publie');
  type Row = Omit<NDish, 'groups' | 'ingredientIds' | 'meatShelf'> & { di: { is_optional: boolean; ingredient: { id: string; food_group: Group | null; shelf: string | null } | null }[] };
  return ((data ?? []) as unknown as Row[]).map(({ di, ...d }) => {
    const ings = di.filter((x) => x.ingredient && !x.is_optional).map((x) => x.ingredient!);
    return {
      ...d,
      groups: [...new Set(ings.map((i) => i.food_group).filter(Boolean) as Group[])],
      ingredientIds: ings.map((i) => i.id),
      meatShelf: ings.some((i) => i.shelf === 'viandes'),
    };
  });
}

export function filterPool(pool: NDish[], allergies: Iterable<string>, prefs: string[]) {
  const al = new Set(allergies);
  const vege = prefs.includes('vegetarien');
  const lowSugar = prefs.includes('peu_sucre');
  return pool.filter((d) => !d.allergens.some((a) => al.has(a)) && !(vege && d.meatShelf) && !(lowSugar && d.is_sweet));
}

export type DayState = { picked: NDish[]; legumeDaysThisWeek: number; weekUses: Map<string, number> };

function hash(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return (h % 1000) / 1000;
}

// Note d'un plat pour un moment donné, selon ce qui est déjà prévu dans la journée
export function score(d: NDish, cat: string, st: DayState, ctx: { have: Set<string>; preferLocal: boolean; seed: string }) {
  if (!d.moments.includes(cat)) return -Infinity;
  if (st.picked.some((p) => p.id === d.id)) return -Infinity; // jamais deux fois le même plat le même jour
  let s = 0;
  const vegMeals = st.picked.filter((p) => has(p, 'legumes')).length;
  const fruitToday = st.picked.some((p) => has(p, 'fruits'));
  const legToday = st.picked.some((p) => has(p, 'legumineuses'));
  const sweetToday = st.picked.filter((p) => p.is_sweet).length;
  const friedToday = st.picked.filter((p) => p.is_fried).length;

  if (MAIN.includes(cat)) {
    if (hasProtein(d)) s += 3;
    if (has(d, 'legumes')) s += vegMeals < 2 ? 3 : 1;
    if (has(d, 'cereales')) s += 1.5;
  } else if (SNACK.includes(cat)) {
    if (has(d, 'fruits')) s += fruitToday ? 2 : 6; // un fruit par jour en priorité
    if (has(d, 'legumes')) s += 1;
    if (d.is_fried) s -= 3;
  } else {
    // petit-déjeuner : énergie pour la matinée, sans friture
    if (has(d, 'cereales')) s += 2;
    if (hasProtein(d)) s += 1.5;
    if (has(d, 'fruits')) s += 1;
    if (d.is_fried) s -= 3;
  }
  if (has(d, 'legumineuses') && !legToday && st.legumeDaysThisWeek < 4) s += 1.5; // légumineuses plusieurs fois par semaine
  if (d.is_sweet) s -= sweetToday ? 5 : 1.5; // sucres libres : au plus une fois par jour
  if (d.is_fried) s -= friedToday ? 5 : 1; // friture : au plus une fois par jour
  s -= (MAIN.includes(cat) ? 3 : 1.2) * (st.weekUses.get(d.id) ?? 0); // variété sur la semaine (plus souple pour fruits et petit-déjeuner)
  if (d.ingredientIds.length) s += 1.5 * (d.ingredientIds.filter((i) => ctx.have.has(i)).length / d.ingredientIds.length);
  if (ctx.preferLocal && d.tags.includes('local')) s += 0.5;
  return s + 0.4 * hash(ctx.seed + d.id); // départage les ex æquo, sans jamais passer devant un meilleur choix
}

// Ordre de remplissage : d'abord les repas principaux, puis le reste complète ce qui manque
const ORDER = ['dejeuner', 'diner', 'petit_dejeuner', 'collation', 'gouter'];

export function composeDay(pool: NDish[], cats: string[], already: NDish[], filledCats: Set<string>, weekUses: Map<string, number>, legumeDaysThisWeek: number, ctx: { have: Set<string>; preferLocal: boolean; seed: string }) {
  const st: DayState = { picked: [...already], legumeDaysThisWeek, weekUses };
  const out: { category_id: string; dish: NDish }[] = [];
  for (const cat of ORDER.filter((c) => cats.includes(c))) {
    if (filledCats.has(cat)) continue;
    const best = pool.map((d) => ({ d, s: score(d, cat, st, ctx) })).filter((x) => x.s > -Infinity).sort((a, b) => b.s - a.s)[0];
    if (!best) continue;
    st.picked.push(best.d);
    weekUses.set(best.d.id, (weekUses.get(best.d.id) ?? 0) + 1);
    out.push({ category_id: cat, dish: best.d });
  }
  return out;
}

// Classement pour la suggestion du moment (« Autre idée » avance dans ce classement)
export function rankFor(pool: NDish[], cat: string, today: NDish[], ctx: { have: Set<string>; preferLocal: boolean; seed: string }) {
  const st: DayState = { picked: today, legumeDaysThisWeek: 0, weekUses: new Map() };
  return pool.map((d) => ({ d, s: score(d, cat, st, ctx) })).filter((x) => x.s > -Infinity).sort((a, b) => b.s - a.s).map((x) => x.d);
}

// Phrase courte : pourquoi ce plat est conseillé
export function why(d: NDish, cat: string) {
  const parts: string[] = [];
  if (has(d, 'legumineuses')) parts.push('des protéines végétales');
  else if (has(d, 'proteines')) parts.push('des protéines');
  else if (has(d, 'laitiers')) parts.push('du calcium');
  if (has(d, 'legumes')) parts.push('des légumes');
  if (has(d, 'fruits')) parts.push('un fruit');
  if (has(d, 'cereales') && cat !== 'collation') parts.push('de l’énergie');
  if (!parts.length) return null;
  const txt = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} et ${parts[parts.length - 1]}` : parts[0];
  return `Apporte ${txt}.`;
}

// Bilan d'une journée par rapport aux repères
export function dayBalance(dishes: NDish[]) {
  const vegMeals = dishes.filter((d) => has(d, 'legumes')).length;
  return {
    cereales: dishes.some((d) => has(d, 'cereales')),
    proteines: dishes.some(hasProtein),
    legumes: vegMeals >= 2,
    fruits: dishes.some((d) => has(d, 'fruits')),
    sweet: dishes.filter((d) => d.is_sweet).length,
    fried: dishes.filter((d) => d.is_fried).length,
  };
}
