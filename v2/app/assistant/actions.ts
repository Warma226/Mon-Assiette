'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { DEFAULT_TZ } from '@/lib/time';
import { todayIso, weekStart } from '@/lib/week';
import { ensurePlan, loadPool, MEALS, plusSession, weekDays } from '@/lib/plus';
import { composeDay } from '@/lib/nutrition';

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const go = (path: string, kind: 'ok' | 'err', msg: string): never => redirect(`${path}${path.includes('?') ? '&' : '?'}${kind}=${encodeURIComponent(msg)}`);

async function needPlus(back: string) {
  const s = await plusSession();
  if (!s.user) redirect('/connexion?suite=profil');
  if (!s.plus) redirect('/abonnement');
  return s as typeof s & { user: NonNullable<typeof s.user> };
}

// Remplit les repas vides d'un jour ou de la semaine (ne remplace jamais un choix déjà fait)
export async function preparePlan(f: FormData) {
  const back = str(f, 'back') || '/assistant';
  const { supabase, user, profile, allergies, prefs } = await needPlus(back);
  const today = todayIso(profile?.timezone || DEFAULT_TZ);
  const day = /^\d{4}-\d{2}-\d{2}$/.test(str(f, 'day')) ? str(f, 'day') : today;
  const scope = str(f, 'scope') === 'semaine' ? 'semaine' : 'jour';
  const { ws, days } = weekDays(day);
  const target = scope === 'semaine' ? days.filter((d) => d >= today) : [day];
  if (!target.length) go(back, 'err', 'Cette semaine est déjà passée.');
  const planId = await ensurePlan(supabase, user.id, ws);
  const { data: existing } = await supabase.from('ma2_meal_plan_items').select('day, category_id, dish_id').eq('plan_id', planId);
  const { pool, have } = await loadPool(supabase, user.id, allergies, prefs);
  if (!pool.length) go(back, 'err', 'Aucun plat ne correspond à tes allergies et préférences pour l’instant.');
  const byId = new Map(pool.map((d) => [d.id, d]));
  const ex = existing ?? [];
  const weekUses = new Map<string, number>();
  for (const i of ex) if (i.dish_id) weekUses.set(i.dish_id, (weekUses.get(i.dish_id) ?? 0) + 1);
  const legumeDay = (d: string) => ex.some((i) => i.day === d && byId.get(i.dish_id)?.groups.includes('legumineuses'));
  let legumeDays = days.filter(legumeDay).length;
  const rows: { plan_id: string; day: string; category_id: string; dish_id: string }[] = [];
  for (const d of target) {
    const today = ex.filter((i) => i.day === d);
    const already = today.map((i) => byId.get(i.dish_id)).filter(Boolean) as NonNullable<ReturnType<typeof byId.get>>[];
    const picks = composeDay(pool, [...MEALS], already, new Set(today.map((i) => i.category_id)), weekUses, legumeDays, { have, seed: user.id + d });
    if (!legumeDay(d) && picks.some((p) => p.dish.groups.includes('legumineuses'))) legumeDays++;
    rows.push(...picks.map((p) => ({ plan_id: planId, day: d, category_id: p.category_id, dish_id: p.dish.id })));
  }
  if (!rows.length) go(back, 'ok', scope === 'semaine' ? 'Ta semaine est déjà complète.' : 'Ta journée est déjà complète.');
  const { error } = await supabase.from('ma2_meal_plan_items').insert(rows);
  if (error) go(back, 'err', 'Enregistrement impossible. Réessaie.');
  revalidatePath('/', 'layout');
  go(back, 'ok', scope === 'semaine' ? `Semaine préparée : ${rows.length} repas ajoutés.` : `Journée préparée : ${rows.length} repas ajoutés.`);
}

// Vide les repas d'un jour pour en proposer d'autres
export async function resetDay(f: FormData) {
  const back = str(f, 'back') || '/assistant';
  const { supabase, user } = await needPlus(back);
  const day = str(f, 'day');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) go(back, 'err', 'Jour invalide.');
  const { data: plan } = await supabase.from('ma2_meal_plans').select('id').eq('user_id', user.id).eq('week_start', weekStart(day)).maybeSingle();
  if (plan) await supabase.from('ma2_meal_plan_items').delete().eq('plan_id', plan.id).eq('day', day);
  const fd = new FormData();
  fd.set('back', back);
  fd.set('day', day);
  fd.set('scope', 'jour');
  return preparePlan(fd);
}

// Liste de courses à partir du planning de la semaine (sans les ingrédients déjà à la maison)
export async function buildShopping(f: FormData) {
  const { supabase, user, profile } = await needPlus('/courses');
  const day = /^\d{4}-\d{2}-\d{2}$/.test(str(f, 'day')) ? str(f, 'day') : todayIso(profile?.timezone || DEFAULT_TZ);
  const ws = weekStart(day);
  const { data: plan } = await supabase
    .from('ma2_meal_plans')
    .select('items:ma2_meal_plan_items(dish:ma2_dishes(name, di:ma2_dish_ingredients(is_optional, ingredient:ma2_ingredients(id, name, shelf))))')
    .eq('user_id', user.id)
    .eq('week_start', ws)
    .maybeSingle();
  type It = { dish: { name: string; di: { is_optional: boolean; ingredient: { id: string; name: string; shelf: string | null } }[] } | null };
  const items = ((plan?.items as unknown as It[]) ?? []).filter((i) => i.dish);
  if (!items.length) go(`/courses?jour=${day}`, 'err', 'Ton planning de la semaine est vide. Prépare-le d’abord.');
  const { data: avail } = await supabase.from('ma2_available_ingredients').select('ingredient_id').eq('user_id', user.id);
  const have = new Set((avail ?? []).map((a) => a.ingredient_id as string));
  const need = new Map<string, { label: string; shelf: string | null; dishes: Set<string> }>();
  for (const it of items)
    for (const x of it.dish!.di) {
      if (x.is_optional || have.has(x.ingredient.id)) continue;
      const e = need.get(x.ingredient.id) ?? { label: x.ingredient.name, shelf: x.ingredient.shelf, dishes: new Set<string>() };
      e.dishes.add(it.dish!.name);
      need.set(x.ingredient.id, e);
    }
  // On remplace la liste automatique précédente, on garde les lignes ajoutées à la main
  await supabase.from('ma2_shopping_items').delete().eq('user_id', user.id).eq('week_start', ws).eq('source', 'auto');
  if (need.size) {
    const { error } = await supabase.from('ma2_shopping_items').insert(
      [...need.entries()].map(([id, e]) => ({ user_id: user.id, week_start: ws, label: e.label, ingredient_id: id, shelf: e.shelf, dishes: [...e.dishes].slice(0, 8), source: 'auto' })),
    );
    if (error) go(`/courses?jour=${day}`, 'err', 'Création de la liste impossible.');
  }
  revalidatePath('/courses');
  go(`/courses?jour=${day}`, 'ok', need.size ? `Liste prête : ${need.size} articles.` : 'Tu as déjà tout à la maison !');
}

export async function addShopping(f: FormData) {
  const { supabase, user } = await needPlus('/courses');
  const label = str(f, 'label').slice(0, 80);
  const ws = str(f, 'ws');
  if (!label || !/^\d{4}-\d{2}-\d{2}$/.test(ws)) go('/courses', 'err', 'Article invalide.');
  await supabase.from('ma2_shopping_items').insert({ user_id: user.id, week_start: ws, label, source: 'manuel', shelf: null });
  revalidatePath('/courses');
  redirect(`/courses?jour=${ws}`);
}

export async function clearChecked(f: FormData) {
  const { supabase, user } = await needPlus('/courses');
  const ws = str(f, 'ws');
  await supabase.from('ma2_shopping_items').delete().eq('user_id', user.id).eq('week_start', ws).eq('checked', true);
  revalidatePath('/courses');
  redirect(`/courses?jour=${ws}`);
}

// ---------- Budget ----------
export async function addExpense(f: FormData) {
  const { supabase, user, profile } = await needPlus('/budget');
  const amount = Math.round(Number(str(f, 'amount').replace(/\s/g, '')));
  const day = /^\d{4}-\d{2}-\d{2}$/.test(str(f, 'day')) ? str(f, 'day') : todayIso(profile?.timezone || DEFAULT_TZ);
  if (!Number.isFinite(amount) || amount < 1 || amount > 10_000_000) go('/budget', 'err', 'Montant invalide.');
  const { error } = await supabase.from('ma2_budget_entries').insert({ user_id: user.id, day, amount, label: str(f, 'label').slice(0, 80) || null });
  if (error) go('/budget', 'err', 'Enregistrement impossible.');
  revalidatePath('/budget');
  go('/budget', 'ok', 'Dépense ajoutée.');
}

export async function deleteExpense(f: FormData) {
  const { supabase, user } = await needPlus('/budget');
  await supabase.from('ma2_budget_entries').delete().eq('id', str(f, 'id')).eq('user_id', user.id);
  revalidatePath('/budget');
  redirect('/budget');
}

// ---------- Famille ----------
export async function addMember(f: FormData) {
  const { supabase, user } = await needPlus('/famille');
  const name = str(f, 'name').slice(0, 40);
  const kind = ['adulte', 'enfant', 'bebe'].includes(str(f, 'kind')) ? str(f, 'kind') : 'adulte';
  const allergies = f.getAll('allergies').map(String).slice(0, 20);
  if (!name) go('/famille', 'err', 'Indique un prénom.');
  const { count } = await supabase.from('ma2_household_members').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
  if ((count ?? 0) >= 15) go('/famille', 'err', '15 personnes maximum.');
  const { error } = await supabase.from('ma2_household_members').insert({ user_id: user.id, name, kind, allergies });
  if (error) go('/famille', 'err', 'Enregistrement impossible.');
  await supabase.from('ma2_profiles').update({ household_size: Math.min(30, (count ?? 0) + 2) }).eq('id', user.id);
  revalidatePath('/', 'layout');
  go('/famille', 'ok', `${name} est ajouté(e) au foyer.`);
}

export async function deleteMember(f: FormData) {
  const { supabase, user } = await needPlus('/famille');
  await supabase.from('ma2_household_members').delete().eq('id', str(f, 'id')).eq('user_id', user.id);
  const { count } = await supabase.from('ma2_household_members').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
  await supabase.from('ma2_profiles').update({ household_size: Math.min(30, (count ?? 0) + 1) }).eq('id', user.id);
  revalidatePath('/', 'layout');
  redirect('/famille');
}

// ---------- Rappels ----------
const KINDS: Record<string, string> = { repas: 'C’est l’heure de manger', eau: 'Bois un verre d’eau', decongeler: 'Sors la viande du congélateur', marche: 'Jour de marché', autre: 'Rappel' };
export async function addReminder(f: FormData) {
  const { supabase, user } = await needPlus('/rappels');
  const kind = KINDS[str(f, 'kind')] ? str(f, 'kind') : 'autre';
  const at = str(f, 'at');
  if (!/^\d{2}:\d{2}$/.test(at)) go('/rappels', 'err', 'Heure invalide.');
  const days = f.getAll('days').map(Number).filter((d) => d >= 1 && d <= 7);
  const label = str(f, 'label').slice(0, 80) || KINDS[kind];
  const { count } = await supabase.from('ma2_reminders').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
  if ((count ?? 0) >= 20) go('/rappels', 'err', '20 rappels maximum.');
  const { error } = await supabase.from('ma2_reminders').insert({ user_id: user.id, kind, label, at_time: at, days: days.length ? days : [1, 2, 3, 4, 5, 6, 7] });
  if (error) go('/rappels', 'err', 'Enregistrement impossible.');
  revalidatePath('/rappels');
  go('/rappels', 'ok', 'Rappel ajouté.');
}

export async function toggleReminder(f: FormData) {
  const { supabase, user } = await needPlus('/rappels');
  await supabase.from('ma2_reminders').update({ enabled: str(f, 'enabled') === '1' }).eq('id', str(f, 'id')).eq('user_id', user.id);
  revalidatePath('/rappels');
  redirect('/rappels');
}

export async function deleteReminder(f: FormData) {
  const { supabase, user } = await needPlus('/rappels');
  await supabase.from('ma2_reminders').delete().eq('id', str(f, 'id')).eq('user_id', user.id);
  revalidatePath('/rappels');
  redirect('/rappels');
}

// ---------- Menus ----------
// Copie un menu dans le planning à partir d'un jour (n'écrase pas les repas déjà choisis)
export async function applyMenu(f: FormData) {
  const slug = str(f, 'slug');
  const back = `/menus/${slug}`;
  const s = await plusSession();
  if (!s.user) redirect('/connexion?suite=profil');
  const { supabase, user, profile } = s;
  const { data: menu } = await supabase.from('ma2_menus').select('id, is_plus, items:ma2_menu_items(dish_id, category_id, day_index, position, dish:ma2_dishes(status))').eq('slug', slug).maybeSingle();
  if (!menu) go(back, 'err', 'Menu introuvable.');
  if (menu!.is_plus && !s.plus) redirect('/abonnement');
  const start = /^\d{4}-\d{2}-\d{2}$/.test(str(f, 'day')) ? str(f, 'day') : todayIso(profile?.timezone || DEFAULT_TZ);
  type MI = { dish_id: string; category_id: string; day_index: number | null; position: number; dish: { status: string } | null };
  const items = ((menu!.items as unknown as MI[]) ?? []).filter((i) => i.dish?.status === 'publie').sort((a, b) => (a.day_index ?? 1) - (b.day_index ?? 1) || a.position - b.position);
  const { addDays } = await import('@/lib/week');
  let added = 0;
  const seen = new Set<string>();
  for (const it of items) {
    const day = addDays(start, (it.day_index ?? 1) - 1);
    const key = `${day}|${it.category_id}`;
    if (seen.has(key)) continue; // une journée type : un plat par moment
    seen.add(key);
    const planId = await ensurePlan(supabase, user.id, weekStart(day));
    const { data: ex } = await supabase.from('ma2_meal_plan_items').select('id').eq('plan_id', planId).eq('day', day).eq('category_id', it.category_id).limit(1);
    if (ex?.length) continue;
    const { error } = await supabase.from('ma2_meal_plan_items').insert({ plan_id: planId, day, category_id: it.category_id, dish_id: it.dish_id });
    if (!error) added++;
  }
  revalidatePath('/', 'layout');
  go(back, 'ok', added ? `${added} repas ajoutés à ton planning.` : 'Ces moments sont déjà remplis dans ton planning.');
}
