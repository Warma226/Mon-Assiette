import Link from 'next/link';
import { requireStaff, STATUS } from '@/lib/admin';
import { setDishStatus } from '../actions';
import { Notice } from '../tabs';

export default async function AdminDishes({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string; statut?: string }> }) {
  const { ok, err, statut } = await searchParams;
  const { supabase } = await requireStaff();
  let q = supabase.from('ma2_dishes').select('id, name, status, image_url, prep_minutes, category:ma2_meal_categories(name)').order('name');
  if (statut && STATUS[statut]) q = q.eq('status', statut);
  const { data } = await q;
  const dishes = (data ?? []) as unknown as { id: string; name: string; status: string; image_url: string | null; prep_minutes: number | null; category: { name: string } | null }[];
  return (
    <>
      <Notice ok={ok} err={err} />
      <Link href="/admin/plats/fiches" className="carte mb-3 flex items-center justify-between px-4 py-3 text-sm font-semibold text-violet-d">Fiches : durée, portions, niveau et coût de tous les plats <span>›</span></Link>
      <div className="mb-3 flex flex-wrap gap-2">
        <Link href="/admin/plats" className={`pastille ${!statut ? 'pastille-on' : ''}`}>Tous</Link>
        {Object.entries(STATUS).map(([k, v]) => (
          <Link key={k} href={`/admin/plats?statut=${k}`} className={`pastille ${statut === k ? 'pastille-on' : ''}`}>{v}</Link>
        ))}
      </div>
      <div className="carte">
        {dishes.length === 0 && <p className="p-4 text-sm text-gris">Aucun plat.</p>}
        {dishes.map((d, i) => (
          <div key={d.id} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${i ? 'border-t border-[#f0ecfb]' : ''}`}>
            {d.image_url ? <img src={d.image_url} alt="" className="h-11 w-11 flex-none rounded-xl object-cover" /> : <span className="h-11 w-11 flex-none rounded-xl bg-lilas" />}
            <Link href={`/admin/plats/${d.id}`} className="min-w-0 flex-1">
              <b className="block truncate text-sm">{d.name}</b>
              <small className="text-xs text-gris">{d.category?.name ?? '—'} · {d.prep_minutes ? `${d.prep_minutes} min` : 'durée à compléter'}</small>
            </Link>
            <form action={setDishStatus} className="flex items-center gap-2">
              <input type="hidden" name="id" value={d.id} />
              <select name="status" defaultValue={d.status} aria-label={`Statut de ${d.name}`} className="h-9 rounded-full border-[1.5px] border-ligne bg-white px-3 text-xs">
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <button className="btn-blanc h-9 px-3 text-xs">OK</button>
            </form>
          </div>
        ))}
      </div>
    </>
  );
}
