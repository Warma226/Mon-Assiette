'use server';
import { revalidatePath } from 'next/cache';
import { back, requireStaff, STATUS } from '@/lib/admin';

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const num = (f: FormData, k: string) => {
  const v = str(f, k);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : NaN;
};

export async function setDishStatus(f: FormData) {
  const { supabase } = await requireStaff();
  const id = str(f, 'id');
  const status = str(f, 'status');
  if (!STATUS[status]) back('/admin/plats', 'err', 'Statut inconnu.');
  const { error } = await supabase.from('ma2_dishes').update({ status }).eq('id', id);
  if (error) back('/admin/plats', 'err', 'Modification refusée.');
  revalidatePath('/', 'layout');
  back('/admin/plats', 'ok', `Statut changé : ${STATUS[status]}.`);
}

export async function saveDish(f: FormData) {
  const { supabase } = await requireStaff();
  const id = str(f, 'id');
  const path = `/admin/plats/${id}`;
  const name = str(f, 'name');
  const description = str(f, 'description');
  const prep = num(f, 'prep_minutes');
  const servings = num(f, 'servings');
  const difficulty = str(f, 'difficulty') || null;
  const status = str(f, 'status');
  if (name.length < 2 || name.length > 80) back(path, 'err', 'Le nom doit faire entre 2 et 80 caractères.');
  if (Number.isNaN(prep) || (prep !== null && (prep < 1 || prep > 1440))) back(path, 'err', 'Durée invalide (en minutes).');
  if (Number.isNaN(servings) || (servings !== null && (servings < 1 || servings > 100))) back(path, 'err', 'Nombre de portions invalide.');
  if (difficulty && !['facile', 'moyen', 'difficile'].includes(difficulty)) back(path, 'err', 'Difficulté inconnue.');
  if (!STATUS[status]) back(path, 'err', 'Statut inconnu.');
  const moments = f.getAll('moments').map(String).filter((m) => ['petit_dejeuner', 'collation', 'dejeuner', 'gouter', 'diner'].includes(m));
  if (!moments.length) back(path, 'err', 'Choisis au moins un moment de la journée.');
  const { error } = await supabase
    .from('ma2_dishes')
    .update({ name, description, prep_minutes: prep, servings, difficulty, category_id: str(f, 'category_id'), status, moments, is_fried: f.get('is_fried') === 'on', is_sweet: f.get('is_sweet') === 'on', is_light: f.get('is_light') === 'on' })
    .eq('id', id);
  if (error) back(path, 'err', 'Enregistrement refusé : ' + error.message);
  revalidatePath('/', 'layout');
  back(path, 'ok', 'Plat enregistré.');
}

export async function setFeedbackStatus(f: FormData) {
  const { supabase } = await requireStaff();
  const status = str(f, 'status');
  if (!['nouveau', 'lu', 'traite'].includes(status)) back('/admin/retours', 'err', 'Statut inconnu.');
  const { error } = await supabase.from('ma2_user_feedback').update({ status }).eq('id', str(f, 'id'));
  if (error) back('/admin/retours', 'err', 'Modification refusée.');
  revalidatePath('/admin', 'layout');
  back('/admin/retours', 'ok', 'Retour mis à jour.');
}

export async function setRole(f: FormData) {
  const { supabase } = await requireStaff(['admin']);
  const role = str(f, 'role');
  const { data, error } = await supabase.rpc('ma2_admin_set_role', { p_email: str(f, 'email'), p_role: role || null });
  if (error) {
    const msg = /self/.test(error.message) ? 'Tu ne peux pas retirer ton propre rôle admin.' : /bad_email/.test(error.message) ? 'Adresse e-mail invalide.' : 'Modification refusée.';
    back('/admin/comptes', 'err', msg);
  }
  revalidatePath('/admin', 'layout');
  back('/admin/comptes', 'ok', data?.pending ? 'Invitation enregistrée : le rôle sera donné à sa première connexion.' : role ? 'Rôle mis à jour.' : 'Rôle retiré.');
}

export async function grantPlus(f: FormData) {
  const { supabase } = await requireStaff(['admin']);
  const days = num(f, 'days');
  const { error } = await supabase.rpc('ma2_admin_grant_plus', { p_user: str(f, 'user'), p_days: days, p_note: str(f, 'note') });
  if (error) back('/admin/comptes', 'err', 'Impossible d’offrir Plus (1 à 400 jours).');
  revalidatePath('/admin', 'layout');
  back('/admin/comptes', 'ok', `${days} jours de Plus offerts.`);
}

export async function setMenu(f: FormData) {
  const { supabase } = await requireStaff();
  const status = str(f, 'status');
  if (!STATUS[status]) back('/admin/menus', 'err', 'Statut inconnu.');
  const { error } = await supabase.from('ma2_menus').update({ status, is_plus: str(f, 'is_plus') === '1' }).eq('id', str(f, 'id'));
  if (error) back('/admin/menus', 'err', 'Modification refusée.');
  revalidatePath('/', 'layout');
  back('/admin/menus', 'ok', `Menu enregistré : ${STATUS[status]}.`);
}

// Fiches des plats : durée, portions, niveau et coût relevé, pour tous les plats en une fois
export async function saveSheets(f: FormData) {
  const { supabase } = await requireStaff();
  const path = '/admin/plats/fiches';
  const city = str(f, 'city').slice(0, 60) || 'Ouagadougou';
  const today = new Date().toISOString().slice(0, 10);
  const ids = f.getAll('id').map(String);
  let saved = 0;
  let priced = 0;
  for (const id of ids) {
    const prep = num(f, `prep_${id}`);
    const servings = num(f, `serv_${id}`);
    const diff = str(f, `diff_${id}`) || null;
    if (Number.isNaN(prep) || (prep !== null && (prep < 1 || prep > 1440))) back(path, 'err', 'Une durée est invalide (1 à 1440 minutes).');
    if (Number.isNaN(servings) || (servings !== null && (servings < 1 || servings > 50))) back(path, 'err', 'Un nombre de portions est invalide (1 à 50).');
    if (diff && !['facile', 'moyen', 'difficile'].includes(diff)) back(path, 'err', 'Niveau inconnu.');
    const { error } = await supabase.from('ma2_dishes').update({ prep_minutes: prep, servings, difficulty: diff }).eq('id', id);
    if (error) back(path, 'err', 'Enregistrement refusé : ' + error.message);
    saved++;

    const cmin = num(f, `cmin_${id}`);
    const cmax = num(f, `cmax_${id}`);
    if (cmin === null && cmax === null) continue;
    if (Number.isNaN(cmin) || Number.isNaN(cmax) || cmin === null || cmax === null || cmin < 0 || cmax < cmin) back(path, 'err', 'Coût : indique un minimum et un maximum (le maximum au moins égal au minimum).');
    const { data: last } = await supabase.from('ma2_food_prices').select('id, price_min, price_max').eq('dish_id', id).eq('status', 'publie').order('observed_at', { ascending: false }).limit(1).maybeSingle();
    if (last && last.price_min === cmin && last.price_max === cmax) continue;
    await supabase.from('ma2_food_prices').update({ status: 'archive' }).eq('dish_id', id).eq('status', 'publie');
    const { error: e2 } = await supabase.from('ma2_food_prices').insert({
      dish_id: id, country_id: 'bf', price_min: cmin, price_max: cmax,
      unit: servings ? `pour ${servings} portion${servings > 1 ? 's' : ''}` : 'pour le plat',
      source: `relevé au marché, ${city}`, observed_at: today, status: 'publie',
    });
    if (e2) back(path, 'err', 'Coût refusé : ' + e2.message);
    priced++;
  }
  revalidatePath('/', 'layout');
  back(path, 'ok', `${saved} fiches enregistrées${priced ? `, ${priced} coût${priced > 1 ? 's' : ''} mis à jour` : ''}.`);
}
