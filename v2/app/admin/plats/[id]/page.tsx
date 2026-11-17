import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireStaff, STATUS } from '@/lib/admin';
import { saveDish } from '../../actions';
import { Notice } from '../../tabs';

export default async function AdminDish({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; err?: string }> }) {
  const [{ id }, { ok, err }] = await Promise.all([params, searchParams]);
  const { supabase } = await requireStaff();
  const [{ data: d }, { data: cats }] = await Promise.all([
    supabase.from('ma2_dishes').select('id, slug, name, description, prep_minutes, servings, difficulty, category_id, status').eq('id', id).maybeSingle(),
    supabase.from('ma2_meal_categories').select('id, name').order('sort'),
  ]);
  if (!d) notFound();
  const label = 'mb-1.5 mt-4 block text-[13px] font-semibold';
  return (
    <>
      <Link href="/admin/plats" className="text-[13px] text-violet-d underline">← Tous les plats</Link>
      <h2 className="titre-sec mb-3 mt-2">{d.name}</h2>
      <Notice ok={ok} err={err} />
      <form action={saveDish} className="carte max-w-2xl p-5">
        <input type="hidden" name="id" value={d.id} />
        <label className={label} htmlFor="name">Nom</label>
        <div className="champ"><input id="name" name="name" defaultValue={d.name} required maxLength={80} /></div>
        <label className={label} htmlFor="description">Description</label>
        <textarea id="description" name="description" defaultValue={d.description ?? ''} rows={4} maxLength={1000} className="w-full rounded-2xl border-[1.5px] border-ligne bg-white p-3.5 text-[15px] outline-none" />
        <div className="grid gap-x-3 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="category_id">Moment</label>
            <div className="champ"><select id="category_id" name="category_id" defaultValue={d.category_id}>{(cats ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          </div>
          <div>
            <label className={label} htmlFor="status">Statut</label>
            <div className="champ"><select id="status" name="status" defaultValue={d.status}>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          </div>
          <div>
            <label className={label} htmlFor="prep_minutes">Durée de préparation (minutes)</label>
            <div className="champ"><input id="prep_minutes" name="prep_minutes" type="number" min={1} max={1440} defaultValue={d.prep_minutes ?? ''} placeholder="Laisser vide si inconnue" /></div>
          </div>
          <div>
            <label className={label} htmlFor="servings">Portions</label>
            <div className="champ"><input id="servings" name="servings" type="number" min={1} max={100} defaultValue={d.servings ?? ''} placeholder="Laisser vide si inconnu" /></div>
          </div>
          <div>
            <label className={label} htmlFor="difficulty">Difficulté</label>
            <div className="champ">
              <select id="difficulty" name="difficulty" defaultValue={d.difficulty ?? ''}>
                <option value="">Non renseignée</option>
                <option value="facile">Facile</option>
                <option value="moyen">Moyen</option>
                <option value="difficile">Difficile</option>
              </select>
            </div>
          </div>
        </div>
        <p className="mt-4 text-[12px] text-gris">Ne remplis une valeur que si elle est vérifiée. Un champ vide n’est pas affiché dans l’appli.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-violet">Enregistrer</button>
          {d.status === 'publie' && <Link href={`/plat/${d.slug}`} className="btn-blanc" target="_blank">Voir dans l’appli</Link>}
        </div>
      </form>
    </>
  );
}
