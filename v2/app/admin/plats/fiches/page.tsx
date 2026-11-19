import Link from 'next/link';
import { requireStaff } from '@/lib/admin';
import { saveSheets } from '../../actions';
import { Notice } from '../../tabs';

// Propositions préparées pour validation (« je prépare, tu valides ») : durée totale en minutes, portions, niveau.
// Elles ne sont enregistrées qu'au clic sur « Enregistrer ». Le coût n'est jamais proposé : il vient d'un relevé de prix.
const PROPOSALS: Record<string, [number, number, 'facile' | 'moyen' | 'difficile']> = {
  'babenda': [60, 4, 'moyen'],
  'bouillie-de-mil': [30, 4, 'facile'],
  'bowl-riz-poulet-crudites': [45, 2, 'facile'],
  'brochettes': [30, 4, 'facile'],
  'brochettes-frites-igname': [50, 4, 'moyen'],
  'burger-niebe': [60, 4, 'moyen'],
  'degue-lait-caille': [20, 4, 'facile'],
  'gonre': [90, 4, 'moyen'],
  'haricot-gari': [90, 4, 'facile'],
  'jus-bissap': [30, 6, 'facile'],
  'mangue': [5, 1, 'facile'],
  'omelette-legumes': [15, 2, 'facile'],
  'poisson-braise-attieke': [40, 2, 'moyen'],
  'poulet-braise': [60, 4, 'moyen'],
  'puree-patate-poulet': [50, 4, 'facile'],
  'ragout-igname': [50, 4, 'facile'],
  'riz-gras': [60, 6, 'moyen'],
  'salade-avocat-tomate': [10, 2, 'facile'],
  'salade-fonio-legumes': [25, 4, 'facile'],
  'smoothie-mangue-gingembre': [10, 2, 'facile'],
  'tartine-avocat-oeuf': [15, 2, 'facile'],
  'to-mil-sauce-baobab': [75, 6, 'moyen'],
  'to-sorgho-sauce-sesame': [75, 6, 'moyen'],
  'zamne-gonre': [180, 4, 'difficile'],
  'zoom-koom': [40, 8, 'moyen'],
};

type Row = { id: string; slug: string; name: string; status: string; prep_minutes: number | null; servings: number | null; difficulty: string | null; prices: { price_min: number; price_max: number; observed_at: string; status: string }[] };

export default async function Sheets({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { ok, err } = await searchParams;
  const { supabase } = await requireStaff();
  const { data } = await supabase
    .from('ma2_dishes')
    .select('id, slug, name, status, prep_minutes, servings, difficulty, prices:ma2_food_prices(price_min, price_max, observed_at, status)')
    .neq('status', 'archive')
    .order('name');
  const rows = (data ?? []) as unknown as Row[];
  const input = 'h-9 w-full rounded-xl border-[1.5px] border-ligne bg-white px-2 text-sm';
  return (
    <>
      <Notice ok={ok} err={err} />
      <div className="mb-3 flex items-center justify-between gap-2">
        <Link href="/admin/plats" className="text-[13px] font-semibold text-violet-d">‹ Plats</Link>
        <span className="text-[11.5px] text-gris">Fond jaune = proposition à valider</span>
      </div>
      <p className="mb-3 text-[12.5px] text-gris">
        Durée totale (préparation + cuisson), portions et niveau : les cases jaunes sont mes propositions, corrige-les si besoin puis enregistre.
        Coût : prix total du plat pour le nombre de portions indiqué, relevé au marché (laisser vide si tu ne sais pas — rien n’est affiché).
      </p>
      <form action={saveSheets}>
        <label className="mb-3 block text-[12.5px] font-semibold">
          Lieu du relevé de prix
          <input name="city" defaultValue="Ouagadougou" className={`${input} mt-1 max-w-xs`} />
        </label>
        <div className="carte overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="text-[11px] uppercase text-gris">
              <tr>
                <th className="px-3 py-2">Plat</th><th className="px-2 py-2">Durée (min)</th><th className="px-2 py-2">Portions</th><th className="px-2 py-2">Niveau</th><th className="px-2 py-2">Coût min (F)</th><th className="px-2 py-2">Coût max (F)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => {
                const p = PROPOSALS[d.slug];
                const price = d.prices.filter((x) => x.status === 'publie').sort((a, b) => b.observed_at.localeCompare(a.observed_at))[0];
                const prop = (v: unknown) => (v == null && p ? 'bg-soleil-l' : '');
                return (
                  <tr key={d.id} className="border-t border-[#f0ecfb]">
                    <td className="px-3 py-2 font-semibold">{d.name}<input type="hidden" name="id" value={d.id} /></td>
                    <td className="px-2 py-2"><input name={`prep_${d.id}`} type="number" min={1} max={1440} defaultValue={d.prep_minutes ?? p?.[0] ?? ''} className={`${input} ${prop(d.prep_minutes)}`} /></td>
                    <td className="px-2 py-2"><input name={`serv_${d.id}`} type="number" min={1} max={50} defaultValue={d.servings ?? p?.[1] ?? ''} className={`${input} ${prop(d.servings)}`} /></td>
                    <td className="px-2 py-2">
                      <select name={`diff_${d.id}`} defaultValue={d.difficulty ?? p?.[2] ?? ''} className={`${input} ${prop(d.difficulty)}`}>
                        <option value="">—</option><option value="facile">Facile</option><option value="moyen">Moyen</option><option value="difficile">Difficile</option>
                      </select>
                    </td>
                    <td className="px-2 py-2"><input name={`cmin_${d.id}`} type="number" min={0} step={25} defaultValue={price?.price_min ?? ''} className={input} /></td>
                    <td className="px-2 py-2"><input name={`cmax_${d.id}`} type="number" min={0} step={25} defaultValue={price?.price_max ?? ''} className={input} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button className="btn-violet mt-4 h-11 w-full text-sm">Enregistrer les fiches</button>
      </form>
    </>
  );
}
