import { requireStaff } from '@/lib/admin';
import { grantPlus, setRole } from '../actions';
import { Notice } from '../tabs';

type U = { id: string; email: string; display_name: string | null; created_at: string; last_sign_in_at: string | null; plus_plan: string | null; plus_until: string | null; role: string | null };
const d = (s: string | null) => (s ? new Date(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

export default async function AdminAccounts({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { ok, err } = await searchParams;
  const { supabase, user } = await requireStaff(['admin']);
  const [{ data: users }, { data: invites }] = await Promise.all([
    supabase.rpc('ma2_admin_users'),
    supabase.from('ma2_admin_invites').select('email, role, created_at').order('created_at', { ascending: false }),
  ]);
  const list = (users ?? []) as U[];
  const team = list.filter((u) => u.role);
  return (
    <>
      <Notice ok={ok} err={err} />
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <section>
          <h2 className="titre-sec mb-3">Comptes ({list.length})</h2>
          <div className="carte">
            {list.map((u, i) => {
              const plus = u.plus_until && new Date(u.plus_until) > new Date();
              return (
                <details key={u.id} className={`group px-4 py-3 ${i ? 'border-t border-[#f0ecfb]' : ''}`}>
                  <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2">
                    <span className="min-w-0 flex-1">
                      <b className="block truncate text-sm">{u.display_name || u.email}</b>
                      <small className="block truncate text-xs text-gris">{u.email} · inscrit le {d(u.created_at)} · vu le {d(u.last_sign_in_at)}</small>
                    </span>
                    {u.role && <span className="pastille h-6">{u.role === 'admin' ? 'Admin' : 'Éditeur'}</span>}
                    <span className={`pastille h-6 ${plus ? 'bg-[#FFD54A] text-encre' : ''}`}>{plus ? `Plus → ${d(u.plus_until)}` : 'Gratuit'}</span>
                  </summary>
                  <form action={grantPlus} className="mt-3 flex flex-wrap items-center gap-2">
                    <input type="hidden" name="user" value={u.id} />
                    <label className="text-xs" htmlFor={`days-${u.id}`}>Offrir</label>
                    <input id={`days-${u.id}`} name="days" type="number" min={1} max={400} defaultValue={7} required className="h-9 w-20 rounded-full border-[1.5px] border-ligne px-3 text-sm" />
                    <span className="text-xs">jours de Plus</span>
                    <input name="note" placeholder="Motif (facultatif)" maxLength={200} className="h-9 min-w-0 flex-1 rounded-full border-[1.5px] border-ligne px-3 text-sm" />
                    <button className="btn-violet h-9 px-4 text-xs">Offrir</button>
                  </form>
                </details>
              );
            })}
          </div>
        </section>
        <section>
          <h2 className="titre-sec mb-3">Équipe</h2>
          <form action={setRole} className="carte p-4">
            <b className="block text-sm">Ajouter ou modifier un membre</b>
            <small className="mb-3 block text-xs text-gris">S’il ne s’est jamais connecté, le rôle lui sera donné à sa première connexion.</small>
            <div className="champ"><input name="email" type="email" required placeholder="adresse@gmail.com" aria-label="E-mail" /></div>
            <div className="champ mt-2">
              <select name="role" aria-label="Rôle" defaultValue="editeur">
                <option value="editeur">Éditeur : gère les plats et les retours</option>
                <option value="admin">Admin : tout, y compris comptes et ventes</option>
                <option value="">Retirer le rôle</option>
              </select>
            </div>
            <button className="btn-violet mt-3 w-full">Valider</button>
          </form>
          <div className="carte mt-3">
            {team.map((u, i) => (
              <div key={u.id} className={`flex items-center gap-2 px-4 py-3 ${i ? 'border-t border-[#f0ecfb]' : ''}`}>
                <span className="min-w-0 flex-1 truncate text-sm">{u.email}{u.id === user.id ? ' (toi)' : ''}</span>
                <span className="pastille h-6">{u.role === 'admin' ? 'Admin' : 'Éditeur'}</span>
              </div>
            ))}
            {(invites ?? []).map((v) => (
              <div key={v.email} className="flex items-center gap-2 border-t border-[#f0ecfb] px-4 py-3">
                <span className="min-w-0 flex-1 truncate text-sm text-gris">{v.email}</span>
                <span className="pastille h-6">Invité · {v.role === 'admin' ? 'Admin' : 'Éditeur'}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
