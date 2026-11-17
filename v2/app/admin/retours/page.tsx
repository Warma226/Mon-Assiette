import { requireStaff } from '@/lib/admin';
import { setFeedbackStatus } from '../actions';
import { Notice } from '../tabs';

const KIND: Record<string, string> = { erreur: 'Erreur', suggestion: 'Suggestion', avis: 'Avis', autre: 'Autre' };
const ST: Record<string, string> = { nouveau: 'Nouveau', lu: 'Lu', traite: 'Traité' };

export default async function AdminFeedback({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { ok, err } = await searchParams;
  const { supabase } = await requireStaff();
  const { data } = await supabase
    .from('ma2_user_feedback')
    .select('id, kind, message, status, created_at, dish:ma2_dishes(name)')
    .order('created_at', { ascending: false })
    .limit(200);
  const rows = (data ?? []) as unknown as { id: string; kind: string; message: string; status: string; created_at: string; dish: { name: string } | null }[];
  return (
    <>
      <Notice ok={ok} err={err} />
      <div className="carte">
        {rows.length === 0 && <p className="p-4 text-sm text-gris">Aucun retour pour l’instant. Les signalements envoyés depuis les fiches des plats arriveront ici.</p>}
        {rows.map((r, i) => (
          <div key={r.id} className={`px-4 py-3.5 ${i ? 'border-t border-[#f0ecfb]' : ''}`}>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gris">
              <span className={`pastille h-6 ${r.status === 'nouveau' ? 'pastille-on' : ''}`}>{KIND[r.kind] ?? r.kind}</span>
              {r.dish && <b className="text-encre">{r.dish.name}</b>}
              <span>{new Date(r.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</span>
            </div>
            <p className="my-2 whitespace-pre-wrap text-sm">{r.message}</p>
            <form action={setFeedbackStatus} className="flex gap-2">
              <input type="hidden" name="id" value={r.id} />
              {Object.entries(ST).map(([k, v]) => (
                <button key={k} name="status" value={k} className={`pastille ${r.status === k ? 'pastille-on' : ''}`}>{v}</button>
              ))}
            </form>
          </div>
        ))}
      </div>
    </>
  );
}
