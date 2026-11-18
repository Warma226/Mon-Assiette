'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Icon } from './Icon';
import { toast } from './Toast';

export function NewPassword() {
  const router = useRouter();
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (p1.length < 8) return setError('8 caractères minimum.');
    if (p1 !== p2) return setError('Les deux mots de passe ne sont pas identiques.');
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password: p1 });
    setBusy(false);
    if (error) {
      if (/different|same/i.test(error.message)) return setError('Choisis un mot de passe différent de l’ancien.');
      if (/weak|password/i.test(error.message)) return setError('Mot de passe trop faible. Mélange lettres et chiffres.');
      return setError('Enregistrement impossible. Le lien a peut-être expiré : redemande-en un.');
    }
    toast('Mot de passe enregistré');
    router.replace('/profil');
    router.refresh();
  }
  return (
    <form onSubmit={submit} className="carte p-5" noValidate>
      {[['p1', 'Nouveau mot de passe', p1, setP1], ['p2', 'Confirme le mot de passe', p2, setP2]].map(([id, label, v, set]) => (
        <div key={id as string} className="mb-3">
          <label htmlFor={id as string} className="mb-2 block text-[13px] font-semibold">{label as string}</label>
          <div className="champ">
            <Icon name="lock" size={19} color="#6B6585" />
            <input id={id as string} type={show ? 'text' : 'password'} autoComplete="new-password" value={v as string} onChange={(e) => (set as (s: string) => void)(e.target.value)} />
          </div>
        </div>
      ))}
      <button type="button" onClick={() => setShow((s) => !s)} className="text-xs font-semibold text-violet-d">{show ? 'Masquer' : 'Afficher'} les mots de passe</button>
      {error && <p role="alert" className="mt-2 text-[13px] text-[#B23A1E]">{error}</p>}
      <button className="btn-violet mt-3.5 w-full" disabled={busy}>{busy ? 'Un instant…' : 'Enregistrer'}</button>
    </form>
  );
}
