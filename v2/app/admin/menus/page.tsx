import Link from 'next/link';
import { requireStaff, STATUS } from '@/lib/admin';
import { setMenu } from '../actions';
import { Notice } from '../tabs';

export default async function AdminMenus({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { ok, err } = await searchParams;
  const { supabase } = await requireStaff();
  const { data } = await supabase.from('ma2_menus').select('id, slug, title, theme, is_plus, status, sort, items:ma2_menu_items(dish:ma2_dishes(name, status))').order('sort');
  type M = { id: string; slug: string; title: string; theme: string; is_plus: boolean; status: string; sort: number; items: { dish: { name: string; status: string } | null }[] };
  const menus = (data ?? []) as unknown as M[];
  return (
    <>
      <Notice ok={ok} err={err} />
      <p className="mb-3 text-[13px] text-gris">
        Un plat « à vérifier » n’apparaît dans aucun menu tant qu’il n’est pas publié. Vérifie d’abord les plats dans l’onglet{' '}
        <Link href="/admin/plats?statut=a_verifier" className="text-violet-d underline">Plats</Link>, puis publie le menu.
      </p>
      <div className="grid gap-3 lg:grid-cols-2">
        {menus.map((m) => {
          const pending = m.items.filter((i) => i.dish && i.dish.status !== 'publie');
          return (
            <div key={m.id} className="carte p-4">
              <div className="flex items-start gap-2">
                <span className="min-w-0 flex-1">
                  <b className="block text-[15px]">{m.title}</b>
                  <small className="text-xs text-gris">{m.items.length} plats · {pending.length ? `${pending.length} à vérifier` : 'tous publiés'}</small>
                </span>
                <Link href={`/menus/${m.slug}`} target="_blank" className="pastille">Aperçu</Link>
              </div>
              {pending.length > 0 && <p className="mt-2 text-[12px] text-[#B7791F]">À vérifier : {[...new Set(pending.map((p) => p.dish!.name))].join(', ')}</p>}
              <form action={setMenu} className="mt-3 flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={m.id} />
                <select name="status" defaultValue={m.status} aria-label="Statut" className="h-9 rounded-full border-[1.5px] border-ligne bg-white px-3 text-xs">
                  {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select name="is_plus" defaultValue={m.is_plus ? '1' : '0'} aria-label="Accès" className="h-9 rounded-full border-[1.5px] border-ligne bg-white px-3 text-xs">
                  <option value="1">Réservé à Plus</option>
                  <option value="0">Gratuit</option>
                </select>
                <button className="btn-violet h-9 px-4 text-xs">Enregistrer</button>
              </form>
            </div>
          );
        })}
      </div>
    </>
  );
}
