import type { SupabaseClient } from '@supabase/supabase-js';
import { getSession, isPlus } from '@/lib/data';
import { addDays, weekStart } from '@/lib/week';
import { filterPool, loadNutriPool } from '@/lib/nutrition';

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

// Catalogue utilisable pour composer un planning, filtré selon le foyer (allergies de chacun, préférences)
export async function loadPool(supabase: SupabaseClient, userId: string, allergies: string[], prefs: string[]) {
  const [all, { data: members }, { data: avail }] = await Promise.all([
    loadNutriPool(supabase),
    supabase.from('ma2_household_members').select('allergies').eq('user_id', userId),
    supabase.from('ma2_available_ingredients').select('ingredient_id').eq('user_id', userId),
  ]);
  const al = [...allergies, ...(members ?? []).flatMap((m) => m.allergies as string[])];
  return { pool: filterPool(all, al, prefs), have: new Set((avail ?? []).map((a) => a.ingredient_id as string)) };
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
