'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from './Toast';

const ERRORS: Record<string, string> = {
  unknown_key: 'Cette clé est introuvable. Vérifie-la dans l’e-mail de Chariow.',
  used_elsewhere: 'Cette clé a déjà été utilisée sur un autre compte.',
  revoked: 'Cette clé a été annulée.',
  expired: 'Cette clé a expiré.',
  bad_key: 'La clé semble incomplète.',
  too_many: 'Trop d’essais. Réessaie dans une heure.',
  not_configured: 'Le paiement n’est pas encore ouvert. Réessaie bientôt.',
  unknown_product: 'Cette clé ne correspond pas à une formule Mon Assiette Plus.',
  activation_failed: 'Chariow a refusé l’activation de cette clé.',
  not_active: 'Cette clé n’est pas active.',
  login: 'Ta session a expiré. Reconnecte-toi.',
};

export function LicenseForm() {
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || key.trim().length < 6) return;
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.functions.invoke('ma2-license', { body: { key: key.trim() } });
    let code: string | undefined = data?.error;
    if (error && 'context' in error && error.context instanceof Response) {
      code = (await error.context.json().catch(() => null))?.error;
    }
    setBusy(false);
    if (data?.ok) {
      toast(data.already ? 'Cette clé est déjà active sur ton compte.' : 'Bienvenue dans Mon Assiette Plus !');
      setKey('');
      router.refresh();
      return;
    }
    toast(ERRORS[code ?? ''] ?? 'Vérification impossible pour le moment. Réessaie.', 'erreur');
  }

  return (
    <form onSubmit={submit} className="carte mt-3 p-4">
      <b className="block text-sm">J’ai ma clé de licence</b>
      <small className="mb-3 block text-xs text-gris">Elle s’affiche après le paiement et arrive aussi par e-mail.</small>
      <label className="champ">
        <span className="sr-only">Clé de licence</span>
        <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Colle ta clé ici" autoComplete="off" spellCheck={false} />
      </label>
      <button type="submit" disabled={busy || key.trim().length < 6} className="btn-violet mt-3 w-full">
        {busy ? 'Vérification…' : 'Activer Plus'}
      </button>
    </form>
  );
}
