'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/lib/data';
import { addToPlan } from './AddToPlan';
import { DishImage } from './ui';
import { Icon } from './Icon';
import { toast } from './Toast';

type Item = { id: string; day: string; category_id: string; note: string | null; dish: { id: string; slug: string; name: string; image_url: string | null; category_id: string } | null };
type Opt = { id: string; name: string; moments: string[]; category_id: string };

// Consulter, ajouter, modifier, supprimer un repas (cahier §5.8)
export function PlanDay({ day, categories, items, dishes }: { day: string; categories: Category[]; items: Item[]; dishes: Opt[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [choice, setChoice] = useState('');
  const [busy, setBusy] = useState(false);

  async function remove(id: string) {
    const { error } = await createClient().from('ma2_meal_plan_items').delete().eq('id', id);
    if (error) return toast('Suppression impossible. Réessaie.', 'erreur');
    toast('Repas retiré du planning');
    router.refresh();
  }

  async function save(cat: string, itemId?: string) {
    if (!choice) return;
    setBusy(true);
    const supabase = createClient();
    const r = itemId ? await supabase.from('ma2_meal_plan_items').update({ dish_id: choice }).eq('id', itemId) : await addToPlan(choice, day, cat);
    setBusy(false);
    if (r.error) return toast('Enregistrement impossible. Réessaie.', 'erreur');
    setEditing(null);
    setChoice('');
    toast(itemId ? 'Repas modifié' : 'Repas ajouté');
    router.refresh();
  }

  return (
    <div className="mt-2">
      {categories.map((c) => {
        const list = items.filter((i) => i.category_id === c.id);
        const opts = dishes.filter((d) => d.moments.includes(c.id) || d.category_id === c.id);
        const picker = (key: string, itemId?: string) =>
          editing === key && (
            <div className="mt-2 flex gap-2">
              <label className="champ h-11 flex-1">
                <span className="sr-only">Choisir un plat</span>
                <select value={choice} onChange={(e) => setChoice(e.target.value)} className="text-sm">
                  <option value="">Choisir un plat…</option>
                  {(opts.length ? opts : dishes).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="btn-violet h-11 px-4 text-sm" disabled={!choice || busy} onClick={() => save(c.id, itemId)}>
                OK
              </button>
              <button type="button" className="rond h-11 w-11" aria-label="Annuler" onClick={() => setEditing(null)}>
                <Icon name="x" size={16} />
              </button>
            </div>
          );
        return (
          <section key={c.id} className="carte mt-2.5 p-3" aria-label={c.name}>
            <small className="block px-1 text-[11.5px] text-gris">
              {c.name} · dès {c.start_hour} h
            </small>
            {list.map((i) => (
              <div key={i.id} className="mt-2">
                <div className="flex items-center gap-3">
                  {i.dish ? <DishImage dish={i.dish} className="h-14 w-14 flex-none" /> : <span className="h-14 w-14 flex-none rounded-[18px] bg-lilas" />}
                  {i.dish ? (
                    <Link href={`/plat/${i.dish.slug}`} className="min-w-0 flex-1 text-[14.5px] font-semibold">
                      {i.dish.name}
                    </Link>
                  ) : (
                    <span className="flex-1 text-sm text-gris">{i.note ?? 'Plat retiré du catalogue'}</span>
                  )}
                  <button type="button" className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-lilas" aria-label={`Modifier ${i.dish?.name ?? 'ce repas'}`} onClick={() => { setEditing(i.id); setChoice(i.dish?.id ?? ''); }}>
                    <Icon name="edit" size={16} />
                  </button>
                  <button type="button" className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-corail-l" aria-label={`Supprimer ${i.dish?.name ?? 'ce repas'}`} onClick={() => remove(i.id)}>
                    <Icon name="trash" size={16} color="#B23A1E" />
                  </button>
                </div>
                {picker(i.id, i.id)}
              </div>
            ))}
            {editing !== 'add:' + c.id ? (
              <button type="button" onClick={() => { setEditing('add:' + c.id); setChoice(''); }} className="mt-2 flex w-full items-center gap-3 rounded-2xl p-1 text-left">
                <span className="flex h-11 w-11 items-center justify-center rounded-[14px] border-2 border-dashed border-[#CFC4F5]">
                  <Icon name="plus" size={20} color="#6C3CF0" width={2.4} />
                </span>
                <b className="text-sm font-semibold text-violet-d">Ajouter un repas</b>
              </button>
            ) : (
              picker('add:' + c.id)
            )}
          </section>
        );
      })}
    </div>
  );
}
