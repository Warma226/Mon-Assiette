import { requireStaff } from '@/lib/admin';

const PLAN: Record<string, string> = { semaine: '1 semaine', mois: '1 mois', trimestre: '3 mois', annee: '1 an', offert: 'Offert' };

export default async function AdminSales() {
  const { supabase } = await requireStaff(['admin']);
  const [{ data }, { data: users }] = await Promise.all([
    supabase.from('ma2_payments').select('id, user_id, plan, days, amount, mode, created_at, details').neq('mode', 'chariow-try').order('created_at', { ascending: false }).limit(300),
    supabase.rpc('ma2_admin_users'),
  ]);
  const mail = new Map(((users ?? []) as { id: string; email: string }[]).map((u) => [u.id, u.email]));
  const rows = (data ?? []) as { id: string; user_id: string; plan: string; days: number; amount: number; mode: string; created_at: string; details: { note?: string } }[];
  const total = rows.filter((r) => r.mode === 'chariow').reduce((s, r) => s + r.amount, 0);
  const f = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F';
  return (
    <>
      <p className="mb-3 text-[13px] text-gris">Clés Chariow activées dans la nouvelle version : <b className="text-encre">{f(total)}</b> au total. Le détail des encaissements reste dans ton espace Chariow.</p>
      <div className="carte overflow-x-auto">
        {rows.length === 0 && <p className="p-4 text-sm text-gris">Aucune vente pour l’instant.</p>}
        {rows.length > 0 && (
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs text-gris">
              <tr><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Compte</th><th className="px-4 py-3 font-medium">Formule</th><th className="px-4 py-3 font-medium">Montant</th><th className="px-4 py-3 font-medium">Origine</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-[#f0ecfb]">
                  <td className="px-4 py-3">{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">{mail.get(r.user_id) ?? '—'}</td>
                  <td className="px-4 py-3">{PLAN[r.plan] ?? r.plan} ({r.days} j)</td>
                  <td className="px-4 py-3">{f(r.amount)}</td>
                  <td className="px-4 py-3 text-gris">{r.mode === 'chariow' ? 'Chariow' : `Offert${r.details?.note ? ' · ' + r.details.note : ''}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
