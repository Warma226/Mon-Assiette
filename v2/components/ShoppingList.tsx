'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from './Toast';

type Item = { id: string; label: string; shelf: string | null; dishes: string[]; checked: boolean };

export function ShoppingList({ items, shelves }: { items: Item[]; shelves: Record<string, string> }) {
  const [list, setList] = useState(items);
  async function toggle(it: Item) {
    setList((l) => l.map((x) => (x.id === it.id ? { ...x, checked: !x.checked } : x)));
    const { error } = await createClient().from('ma2_shopping_items').update({ checked: !it.checked }).eq('id', it.id);
    if (error) {
      toast('Modification impossible.', 'erreur');
      setList((l) => l.map((x) => (x.id === it.id ? { ...x, checked: it.checked } : x)));
    }
  }
  const groups = [...Object.keys(shelves), 'autre'].map((k) => [k, list.filter((i) => (i.shelf ?? 'autre') === k)] as const).filter(([, l]) => l.length);
  const left = list.filter((i) => !i.checked).length;
  const share = `Ma liste de courses (Mon Assiette) :\n` + list.filter((i) => !i.checked).map((i) => `• ${i.label}`).join('\n');
  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <small className="text-[13px] text-gris">{left} article{left > 1 ? 's' : ''} à acheter</small>
        {left > 0 && (
          <a href={`https://wa.me/?text=${encodeURIComponent(share)}`} target="_blank" rel="noopener noreferrer" className="pastille bg-[#25D366] font-semibold text-white">
            Partager sur WhatsApp
          </a>
        )}
      </div>
      {groups.map(([k, l]) => (
        <section key={k} className="mb-3">
          <h3 className="mb-1.5 ml-1 text-xs font-bold uppercase tracking-wide text-gris">{shelves[k] ?? 'Autres'}</h3>
          <div className="carte">
            {l.map((it, i) => (
              <label key={it.id} className={`flex cursor-pointer items-center gap-3 px-4 py-3 ${i ? 'border-t border-[#f0ecfb]' : ''}`}>
                <input type="checkbox" checked={it.checked} onChange={() => toggle(it)} className="h-5 w-5 flex-none accent-[#6C3CF0]" />
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm ${it.checked ? 'text-gris line-through' : 'font-medium'}`}>{it.label}</span>
                  {it.dishes.length > 0 && <small className="block truncate text-[11.5px] text-gris">Pour : {it.dishes.join(', ')}</small>}
                </span>
              </label>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
