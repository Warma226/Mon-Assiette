'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from './Toast';

// Signaler une erreur ou proposer une correction sur un plat (arrive dans l'espace admin)
export function ReportForm({ dishId, userId }: { dishId: string; userId: string | null }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState('erreur');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (msg.trim().length < 3) return;
    setBusy(true);
    const { error } = await createClient().from('ma2_user_feedback').insert({ dish_id: dishId, user_id: userId, kind, message: msg.trim().slice(0, 2000) });
    setBusy(false);
    if (error) return toast('Envoi impossible. Réessaie.', 'erreur');
    toast('Merci ! L’équipe va regarder.');
    setMsg('');
    setOpen(false);
  }

  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-5 text-[12.5px] text-violet-d underline">
        Signaler une erreur sur ce plat
      </button>
    );
  return (
    <form onSubmit={send} className="carte mt-5 p-4">
      <b className="mb-2 block text-sm">Ton retour</b>
      <div className="mb-2 flex gap-2">
        {[['erreur', 'Erreur'], ['suggestion', 'Suggestion']].map(([k, v]) => (
          <button key={k} type="button" onClick={() => setKind(k)} className={`pastille ${kind === k ? 'pastille-on' : ''}`}>{v}</button>
        ))}
      </div>
      <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} maxLength={2000} placeholder="Ex. : ce plat se prépare plutôt avec…" aria-label="Message" className="w-full rounded-2xl border-[1.5px] border-ligne bg-white p-3 text-sm outline-none" />
      <div className="mt-2 flex gap-2">
        <button disabled={busy || msg.trim().length < 3} className="btn-violet h-10 text-sm">{busy ? 'Envoi…' : 'Envoyer'}</button>
        <button type="button" onClick={() => setOpen(false)} className="btn-blanc h-10 text-sm">Annuler</button>
      </div>
    </form>
  );
}
