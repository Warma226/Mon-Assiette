'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { DishImage, Empty } from './ui';
import { Icon } from './Icon';
import { toast } from './Toast';

type Ing = { id: string; name: string; aliases: string[]; group: string | null };
type D = { id: string; slug: string; name: string; image_url: string | null; category_id: string; allergens: string[]; prep_minutes: number | null; items: { id: string; name: string; optional: boolean; substitutes: string | null }[] };

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const KEY = 'ma2:ingredients';

// Rayons de la cuisine, dans l'ordre où on y pense
const SHELVES: { id: string; label: string; groups: string[]; tint: string; on: string }[] = [
  { id: 'base', label: 'Céréales et tubercules', groups: ['cereales'], tint: 'bg-[#FFF6D6]', on: 'bg-[#B7791F]' },
  { id: 'leg', label: 'Haricots et graines', groups: ['legumineuses'], tint: 'bg-[#F6EDE3]', on: 'bg-[#8A5A2B]' },
  { id: 'veg', label: 'Légumes et feuilles', groups: ['legumes'], tint: 'bg-[#E7F6EC]', on: 'bg-[#047857]' },
  { id: 'fruit', label: 'Fruits', groups: ['fruits'], tint: 'bg-[#FFE9E4]', on: 'bg-[#D9381E]' },
  { id: 'prot', label: 'Viande, poisson, œufs, lait', groups: ['proteines', 'laitiers'], tint: 'bg-[#ECE5FF]', on: 'bg-[#6C3CF0]' },
  { id: 'epi', label: 'Huile, sucre et assaisonnements', groups: ['matieres_grasses', 'sucres', 'condiments'], tint: 'bg-[#F1F0F5]', on: 'bg-[#3B3456]' },
];
const EMOJI: [RegExp, string][] = [
  [/arachide/, '🥜'], [/attieke|riz|fonio/, '🍚'], [/avocat/, '🥑'], [/carotte/, '🥕'], [/chou/, '🥬'], [/citron/, '🍋'], [/concombre/, '🥒'],
  [/mais/, '🌽'], [/mil|sorgho/, '🌾'], [/feuilles/, '🍃'], [/bissap|hibiscus/, '🌺'], [/gari/, '🥣'], [/gingembre/, '🫚'], [/gombo/, '🫑'],
  [/zamne|acacia|soumbala|sesame/, '🫘'], [/haricot|niebe/, '🫘'], [/huile/, '🫗'], [/igname|patate/, '🍠'], [/lait/, '🥛'], [/mangue/, '🥭'],
  [/mouton|boeuf|viande/, '🥩'], [/oeuf/, '🥚'], [/oignon/, '🧅'], [/pain/, '🥖'], [/piment/, '🌶️'], [/poisson/, '🐟'], [/pomme de terre/, '🥔'],
  [/poulet/, '🍗'], [/sel/, '🧂'], [/sucre/, '🍬'], [/tomate/, '🍅'],
];
const emoji = (name: string) => EMOJI.find(([r]) => r.test(norm(name).replace(/œ/g, 'oe')))?.[1] ?? '🥄';

// « Que cuisiner avec mes ingrédients ? » (cahier §5.5) : disponibles, manquants, substitutions, temps.
export function IngredientMatcher({ ingredients, dishes, initial, userId, allergies }: { ingredients: Ing[]; dishes: D[]; initial: string[]; userId: string | null; allergies: string[] }) {
  const [have, setHave] = useState<string[]>(initial);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (userId) return;
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (Array.isArray(v)) setHave(v.filter((x) => typeof x === 'string'));
    } catch {}
  }, [userId]);

  async function toggle(id: string) {
    const on = !have.includes(id);
    const next = on ? [...have, id] : have.filter((x) => x !== id);
    setHave(next);
    if (!userId) {
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return;
    }
    const supabase = createClient();
    const { error } = on
      ? await supabase.from('ma2_available_ingredients').insert({ user_id: userId, ingredient_id: id })
      : await supabase.from('ma2_available_ingredients').delete().eq('user_id', userId).eq('ingredient_id', id);
    if (error && error.code !== '23505') {
      setHave(have);
      toast('Enregistrement impossible. Vérifie ta connexion.', 'erreur');
    }
  }

  const shown = useMemo(() => {
    const t = norm(q.trim());
    return ingredients.filter((i) => !t || norm([i.name, ...i.aliases].join(' ')).includes(t));
  }, [q, ingredients]);

  const results = useMemo(() => {
    if (!have.length) return [];
    return dishes
      .filter((d) => !d.allergens.some((a) => allergies.includes(a)))
      .map((d) => {
        const need = d.items.filter((x) => !x.optional);
        const ok = need.filter((x) => have.includes(x.id));
        const miss = need.filter((x) => !have.includes(x.id));
        return { d, ok, miss, score: need.length ? ok.length / need.length : 0 };
      })
      .filter((r) => r.ok.length > 0)
      .sort((a, b) => b.score - a.score || a.miss.length - b.miss.length)
      .slice(0, 12);
  }, [have, dishes, allergies]);

  return (
    <div className="px-5">
      <p className="mb-3 text-[13px] text-gris">Touche ce que tu as dans ta cuisine. Kalou te dit ce que tu peux préparer.</p>
      <label className="champ">
        <Icon name="search" size={20} color="#6B6585" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher un ingrédient…" aria-label="Chercher un ingrédient" />
      </label>
      {SHELVES.map((sh) => {
        const list = shown.filter((i) => sh.groups.includes(i.group ?? 'condiments'));
        if (!list.length) return null;
        const n = list.filter((i) => have.includes(i.id)).length;
        return (
          <section key={sh.id} className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[14px] font-bold">{sh.label}</h3>
              {n > 0 && <small className="text-[11.5px] font-semibold text-violet-d">{n} choisi{n > 1 ? 's' : ''}</small>}
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {list.map((i) => {
                const on = have.includes(i.id);
                return (
                  <button key={i.id} type="button" onClick={() => toggle(i.id)} aria-pressed={on}
                    className={`relative flex h-[86px] flex-col items-center justify-center gap-1 rounded-2xl px-1.5 text-center text-[12px] font-semibold leading-tight transition ${on ? `${sh.on} text-white shadow-[0_6px_16px_rgba(23,19,43,0.18)]` : `${sh.tint} text-encre`}`}>
                    {on && <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white"><Icon name="check" size={12} color="#17132B" width={3} /></span>}
                    <span className="text-[26px] leading-none" aria-hidden="true">{emoji(i.name)}</span>
                    <span className="line-clamp-2">{i.name}</span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
      {shown.length === 0 && <p className="mt-4 text-center text-[13px] text-gris">Aucun ingrédient ne correspond à « {q} ».</p>}
      {have.length > 0 && (
        <div className="sticky bottom-[96px] z-30 mt-4 flex items-center gap-2 rounded-full bg-encre p-1.5 pl-4 text-white shadow-[0_10px_30px_rgba(23,19,43,0.3)] lg:bottom-4">
          <span className="flex-1 text-[13px] font-semibold">{have.length} ingrédient{have.length > 1 ? 's' : ''} · {results.length} plat{results.length > 1 ? 's' : ''} possible{results.length > 1 ? 's' : ''}</span>
          <a href="#resultats" className="inline-flex h-10 items-center rounded-full bg-[#FFD54A] px-4 text-[13px] font-bold text-encre">Voir les plats</a>
        </div>
      )}
      {!userId && have.length > 0 && (
        <p className="mt-3 text-xs text-gris">
          Enregistré sur ce téléphone. <Link href="/connexion" className="font-semibold text-violet-d underline">Connecte-toi</Link> pour le retrouver partout.
        </p>
      )}

      <div id="resultats" className="mb-3 mt-6 flex scroll-mt-4 items-center justify-between">
        <h2 className="titre-sec">Tu peux préparer</h2>
        {results.length > 0 && <small className="text-gris">{results.length} plats</small>}
      </div>
      {!have.length ? (
        <Empty title="Choisis tes ingrédients" text="Sélectionne au moins un ingrédient ci-dessus pour voir les plats possibles." />
      ) : !results.length ? (
        <Empty title="Rien de possible pour l’instant" text="Ajoute un ingrédient de base (mil, riz, haricot…) pour voir des idées." />
      ) : (
        results.map(({ d, ok, miss, score }) => (
          <Link key={d.id} href={`/plat/${d.slug}`} className="carte mb-2.5 flex items-center gap-3 p-3">
            <DishImage dish={d} className="h-16 w-16 flex-none" />
            <span className="min-w-0 flex-1">
              <b className="block text-[14.5px]">{d.name}</b>
              <span className="block text-xs font-semibold text-emeraude">{miss.length ? `${ok.length} sur ${ok.length + miss.length} ingrédients` : 'Tout est là'}</span>
              {miss.length > 0 && (
                <span className="block text-xs text-[#B23A1E]">
                  Manque : {miss.map((m) => m.name.toLowerCase() + (m.substitutes ? ` (ou ${m.substitutes})` : '')).join(', ')}
                </span>
              )}
              {d.prep_minutes ? <small className="text-[11.5px] text-gris">{d.prep_minutes} min</small> : null}
            </span>
            <span className={`flex h-[46px] w-[46px] flex-none items-center justify-center rounded-full text-[13px] font-bold text-white ${score === 1 ? 'bg-violet' : score >= 0.6 ? 'bg-emeraude' : 'bg-[#B7791F]'}`}>{Math.round(score * 100)}%</span>
          </Link>
        ))
      )}
    </div>
  );
}
