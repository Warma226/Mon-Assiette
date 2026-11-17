'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Icon } from './Icon';

// Connexion sans mot de passe : lien envoyé par e-mail, ou Google.
export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'sent' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const base = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL;
  const callback = `${base}/auth/callback?next=${encodeURIComponent(next)}`;

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      setState('error');
      setMsg('Adresse e-mail invalide.');
      return;
    }
    setState('busy');
    const { error } = await createClient().auth.signInWithOtp({ email: v, options: { emailRedirectTo: callback, shouldCreateUser: true } });
    if (error) {
      setState('error');
      setMsg(error.status === 429 ? 'Trop de demandes. Réessaie dans quelques minutes.' : 'Envoi impossible pour le moment. Réessaie.');
      return;
    }
    setState('sent');
  }

  async function google() {
    const { error } = await createClient().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callback } });
    if (error) {
      setState('error');
      setMsg('La connexion Google n’est pas encore disponible. Utilise ton e-mail.');
    }
  }

  if (state === 'sent')
    return (
      <div role="status" className="carte p-5 text-center">
        <Icon name="mail" size={32} color="#6C3CF0" className="mx-auto" />
        <b className="mt-2 block">Vérifie ta boîte mail</b>
        <p className="mt-1 text-[13px] text-gris">
          Nous avons envoyé un lien de connexion à <b>{email}</b>. Ouvre-le sur ce téléphone.
        </p>
      </div>
    );

  return (
    <>
      <form onSubmit={sendLink} noValidate>
        <label htmlFor="email" className="mb-2 block text-[13px] font-semibold">
          Adresse e-mail
        </label>
        <div className="champ">
          <Icon name="mail" size={19} color="#6B6585" />
          <input id="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@exemple.com" aria-invalid={state === 'error'} />
        </div>
        {state === 'error' && (
          <p role="alert" className="mt-2 text-[13px] text-[#B23A1E]">
            {msg}
          </p>
        )}
        <button type="submit" className="btn-violet mt-3.5 w-full" disabled={state === 'busy'}>
          {state === 'busy' ? 'Envoi…' : 'Recevoir mon lien de connexion'}
        </button>
      </form>
      <div className="my-4 flex items-center gap-2.5">
        <span className="h-px flex-1 bg-[#E2DCF7]" />
        <small className="text-gris">ou</small>
        <span className="h-px flex-1 bg-[#E2DCF7]" />
      </div>
      <button type="button" onClick={google} className="btn-blanc w-full border-[#E2DCF7] text-encre">
        <Icon name="google" size={18} /> Continuer avec Google
      </button>
    </>
  );
}
