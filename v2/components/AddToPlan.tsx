'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { addDays, dayLabel, todayIso, weekStart } from '@/lib/week';
import { Icon } from './Icon';
import { toast } from './Toast';

const MOMENTS = [
  ['petit_dejeuner', 'Petit-déjeuner'],
  ['collation', 'Collation'],
  ['dejeuner', 'Déjeuner'],
  ['gouter', 'Goûter'],
  ['diner', 'Dîner'],
];

export async function addToPlan(dishId: string | null, day: string, category: string, note?: string) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const uid = data.user?.id;
  if (!uid) return { error: 'auth' };
  const ws = weekStart(day);
  let { data: plan } = await supabase.from('ma2_meal_plans').select('id').eq('user_id', uid).eq('week_start', ws).maybeSingle();
  if (!plan) {
    const r = await supabase.from('ma2_meal_plans').insert({ user_id: uid, week_start: ws }).select('id').single();
    if (r.error) {
      const again = await supabase.from('ma2_meal_plans').select('id').eq('user_id', uid).eq('week_start', ws).maybeSingle();
      plan = again.data;
    } else plan = r.data;
  }
  if (!plan) return { error: 'plan' };
  const { error } = await supabase.from('ma2_meal_plan_items').insert({ plan_id: plan.id, day, category_id: category, dish_id: dishId, note: note ?? null });
  return { error: error?.message ?? null };
}

export function AddToPlan({ dishId, defaultCategory, loggedIn }: { dishId: string; defaultCategory: string; loggedIn: boolean }) {
  const router = useRouter();
  const today = todayIso();
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState(today);
  const [cat, setCat] = useState(defaultCategory);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const r = await addToPlan(dishId, day, cat);
    setBusy(false);
    if (r.error === 'auth') return router.push('/connexion?suite=planning');
    if (r.error) return toast('Impossible d’ajouter ce repas. Réessaie.', 'erreur');
    setOpen(false);
    toast(`Ajouté au planning : ${dayLabel(day, 'long')}`);
  }

  if (!open)
    return (
      <button type="button" className="btn-violet flex-1" onClick={() => (loggedIn ? setOpen(true) : router.push('/connexion?suite=planning'))}>
        <Icon name="plan" size={18} color="#fff" /> Ajouter au planning
      </button>
    );

  return (
    <div className="carte w-full p-4">
      <b className="text-sm">Quand veux-tu le manger ?</b>
      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {Array.from({ length: 7 }, (_, i) => addDays(today, i)).map((d) => (
          <button key={d} type="button" onClick={() => setDay(d)} aria-pressed={d === day} className={`pastille h-[34px] capitalize ${d === day ? 'pastille-on' : ''}`}>
            {d === today ? 'Aujourd’hui' : `${dayLabel(d)} ${Number(d.slice(8))}`}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {MOMENTS.map(([id, l]) => (
          <button key={id} type="button" onClick={() => setCat(id)} aria-pressed={id === cat} className={`pastille h-[34px] ${id === cat ? 'pastille-on' : ''}`}>
            {l}
          </button>
        ))}
      </div>
      <div className="mt-3.5 flex gap-2">
        <button type="button" className="btn-blanc h-11 flex-1 text-sm" onClick={() => setOpen(false)}>
          Annuler
        </button>
        <button type="button" className="btn-violet h-11 flex-1 text-sm" disabled={busy} onClick={save}>
          {busy ? 'Ajout…' : 'Ajouter'}
        </button>
      </div>
    </div>
  );
}
