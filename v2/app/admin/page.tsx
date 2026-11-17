import Link from 'next/link';
import { requireStaff } from '@/lib/admin';

type Stats = { users: number; users_7d: number; plus: number; dishes: number; drafts: number; feedback_new: number; revenue_30d: number; sales_30d: number };

export default async function AdminHome() {
  const { supabase, role } = await requireStaff();
  const { data } = await supabase.rpc('ma2_admin_stats');
  const s = (data ?? {}) as Stats;
  const fcfa = (n: number) => `${new Intl.NumberFormat('fr-FR').format(n ?? 0)} F`;
  const tiles: [string, string | number, string, string?][] = [
    ['Comptes', s.users, `+${s.users_7d ?? 0} cette semaine`, role === 'admin' ? '/admin/comptes' : undefined],
    ['Abonnés Plus actifs', s.plus, 'en ce moment', role === 'admin' ? '/admin/comptes' : undefined],
    ['Ventes (30 jours)', fcfa(s.revenue_30d), `${s.sales_30d ?? 0} clé(s) activée(s)`, role === 'admin' ? '/admin/ventes' : undefined],
    ['Plats publiés', s.dishes, `${s.drafts ?? 0} en attente`, '/admin/plats'],
    ['Nouveaux retours', s.feedback_new, 'à lire', '/admin/retours'],
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {tiles.map(([label, value, sub, href]) => {
        const body = (
          <>
            <small className="block text-xs text-gris">{label}</small>
            <b className="mt-1 block text-2xl">{value ?? 0}</b>
            <small className="text-xs text-gris">{sub}</small>
          </>
        );
        return href ? (
          <Link key={label} href={href} className="carte p-4">{body}</Link>
        ) : (
          <div key={label} className="carte p-4">{body}</div>
        );
      })}
    </div>
  );
}
