'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Preference, Profile } from '@/lib/data';
import { Icon } from './Icon';
import { toast } from './Toast';

const TZ: Record<string, string> = { bf: 'Africa/Ouagadougou', ci: 'Africa/Abidjan', sn: 'Africa/Dakar', ml: 'Africa/Bamako', bj: 'Africa/Porto-Novo', tg: 'Africa/Lome', ne: 'Africa/Niamey', gn: 'Africa/Conakry' };

// Profil alimentaire (cahier §5.7) : seulement ce qui sert aux suggestions.
export function ProfileForm({ profile, countries, preferences, selectedPrefs, selectedAllergies }: { profile: Profile; countries: { id: string; name: string; is_active: boolean }[]; preferences: Preference[]; selectedPrefs: string[]; selectedAllergies: string[] }) {
  const router = useRouter();
  const [f, setF] = useState({
    display_name: profile.display_name ?? '',
    country_id: profile.country_id ?? 'bf',
    city: profile.city ?? '',
    budget_amount: profile.budget_amount?.toString() ?? '',
    budget_period: profile.budget_period ?? 'jour',
    household_size: profile.household_size?.toString() ?? '',
  });
  const [prefs, setPrefs] = useState(selectedPrefs);
  const [allergies, setAllergies] = useState(selectedAllergies);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const flip = (list: string[], setList: (v: string[]) => void, id: string) => setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const budget = f.budget_amount ? Number(f.budget_amount) : null;
    const household = f.household_size ? Number(f.household_size) : null;
    if ((budget !== null && (!Number.isInteger(budget) || budget < 0)) || (household !== null && (!Number.isInteger(household) || household < 1 || household > 30))) {
      toast('Vérifie le budget et le nombre de personnes.', 'erreur');
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const uid = profile.id;
    const r1 = await supabase
      .from('ma2_profiles')
      .update({
        display_name: f.display_name.trim().slice(0, 60) || null,
        country_id: f.country_id,
        city: f.city.trim().slice(0, 80) || null,
        timezone: TZ[f.country_id] ?? 'Africa/Ouagadougou',
        budget_amount: budget,
        budget_period: budget !== null ? f.budget_period : null,
        household_size: household,
      })
      .eq('id', uid);
    const r2 = await supabase.from('ma2_user_preferences').delete().eq('user_id', uid);
    const r3 = prefs.length ? await supabase.from('ma2_user_preferences').insert(prefs.map((p) => ({ user_id: uid, preference_id: p }))) : { error: null };
    const r4 = await supabase.from('ma2_user_allergies').delete().eq('user_id', uid);
    const r5 = allergies.length ? await supabase.from('ma2_user_allergies').insert(allergies.map((a) => ({ user_id: uid, allergen_id: a }))) : { error: null };
    setBusy(false);
    if (r1.error || r2.error || r3.error || r4.error || r5.error) return toast('Enregistrement impossible. Réessaie.', 'erreur');
    toast('Profil enregistré');
    router.refresh();
  }

  async function logout() {
    await createClient().auth.signOut();
    router.push('/');
    router.refresh();
  }

  const chips = (kind: Preference['kind'][], list: string[], setList: (v: string[]) => void) => (
    <div className="flex flex-wrap gap-2">
      {preferences
        .filter((p) => kind.includes(p.kind))
        .map((p) => {
          const on = list.includes(p.id);
          return (
            <button key={p.id} type="button" aria-pressed={on} onClick={() => flip(list, setList, p.id)} className={`pastille h-[34px] ${on ? 'pastille-on' : 'bg-white'}`}>
              {on && <Icon name="check" size={13} color="#fff" width={2.6} />} {p.name}
            </button>
          );
        })}
    </div>
  );

  return (
    <form onSubmit={save} className="mt-5 space-y-5">
      <h2 className="titre-sec">Profil alimentaire</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">Prénom ou pseudo</span>
          <span className="champ"><input value={f.display_name} onChange={set('display_name')} maxLength={60} autoComplete="given-name" /></span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">Pays</span>
          <span className="champ">
            <select value={f.country_id} onChange={set('country_id')}>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.is_active ? '' : ' (bientôt)'}
                </option>
              ))}
            </select>
          </span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">Ville (facultatif)</span>
          <span className="champ"><input value={f.city} onChange={set('city')} maxLength={80} autoComplete="address-level2" /></span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">Personnes à nourrir (facultatif)</span>
          <span className="champ"><input value={f.household_size} onChange={set('household_size')} inputMode="numeric" pattern="[0-9]*" /></span>
        </label>
      </div>
      <div>
        <span className="mb-1.5 block text-[13px] font-semibold">Budget alimentaire indicatif (F CFA)</span>
        <div className="flex gap-2">
          <span className="champ flex-1"><input value={f.budget_amount} onChange={set('budget_amount')} inputMode="numeric" pattern="[0-9]*" placeholder="Ex. 1500" aria-label="Montant du budget" /></span>
          <span className="champ w-36">
            <select value={f.budget_period} onChange={set('budget_period')} aria-label="Période du budget">
              <option value="jour">par jour</option>
              <option value="semaine">par semaine</option>
            </select>
          </span>
        </div>
      </div>
      <div>
        <span className="mb-2 block text-[13px] font-semibold">Préférences</span>
        {chips(['preference', 'restriction'], prefs, setPrefs)}
      </div>
      <div>
        <span className="mb-2 block text-[13px] font-semibold">Allergies déclarées</span>
        {chips(['allergie'], allergies, setAllergies)}
        <p className="mt-2 text-[11.5px] text-gris">Ces choix servent seulement à filtrer les plats. Ce n’est pas un avis médical.</p>
      </div>
      <button type="submit" className="btn-violet w-full" disabled={busy}>
        {busy ? 'Enregistrement…' : 'Enregistrer'}
      </button>
      <button type="button" onClick={logout} className="flex w-full items-center justify-center gap-2 py-2 text-sm font-semibold text-[#B23A1E]">
        <Icon name="logout" size={18} color="#B23A1E" /> Se déconnecter
      </button>
    </form>
  );
}
