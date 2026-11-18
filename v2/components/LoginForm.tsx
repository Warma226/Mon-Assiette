'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Icon } from './Icon';

type Mode = 'login' | 'signup' | 'forgot';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Connexion par e-mail + mot de passe (création de compte, oubli), ou Google.
export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState<'' | 'confirm' | 'reset'>('');
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const callback = (to: string) => `${origin}/auth/callback?next=${encodeURIComponent(to)}`;

  function switchTo(m: Mode) {
    setMode(m);
    setError('');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const mail = email.trim().toLowerCase();
    if (!EMAIL.test(mail)) return setError('Adresse e-mail invalide.');
    if (mode !== 'forgot' && password.length < 8) return setError('Le mot de passe doit faire au moins 8 caractères.');
    if (mode === 'signup' && name.trim().length < 2) return setError('Indique ton prénom.');
    setBusy(true);
    setError('');
    const supabase = createClient();
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: mail, password });
      setBusy(false);
      if (error) {
        if (/confirm/i.test(error.message)) return setError('Ton adresse n’est pas encore confirmée. Ouvre le lien reçu par e-mail à l’inscription.');
        if (error.status === 429) return setError('Trop d’essais. Réessaie dans quelques minutes.');
        return setError('E-mail ou mot de passe incorrect. Si tu te connectais avant avec un lien ou Google, clique sur « Mot de passe oublié » pour en créer un.');
      }
      await supabase.rpc('ma2_ensure_profile');
      router.replace(next);
      router.refresh();
      return;
    }
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email: mail, password, options: { emailRedirectTo: callback(next), data: { full_name: name.trim() } } });
      setBusy(false);
      if (error) {
        if (/already|registered|exists/i.test(error.message)) return setError('Un compte existe déjà avec cet e-mail. Connecte-toi ou utilise « Mot de passe oublié ».');
        if (/password/i.test(error.message)) return setError('Mot de passe trop faible. Mélange lettres et chiffres (8 caractères minimum).');
        if (error.status === 429) return setError('Trop de demandes. Réessaie dans quelques minutes.');
        return setError('Création du compte impossible pour le moment. Réessaie.');
      }
      // Si l'adresse existe déjà, Supabase ne renvoie pas d'erreur mais un compte sans identité
      if (data.user && data.user.identities && data.user.identities.length === 0) return setError('Un compte existe déjà avec cet e-mail. Connecte-toi ou utilise « Mot de passe oublié ».');
      if (data.session) {
        await supabase.rpc('ma2_ensure_profile');
        await supabase.from('ma2_profiles').update({ display_name: name.trim().slice(0, 60) }).eq('id', data.user!.id);
        router.replace(next);
        router.refresh();
        return;
      }
      return setSent('confirm');
    }
    const { error } = await supabase.auth.resetPasswordForEmail(mail, { redirectTo: callback('/mot-de-passe') });
    setBusy(false);
    if (error && error.status === 429) return setError('Trop de demandes. Réessaie dans quelques minutes.');
    setSent('reset');
  }

  async function google() {
    const { error } = await createClient().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callback(next) } });
    if (error) setError('La connexion Google n’est pas disponible pour le moment.');
  }

  if (sent)
    return (
      <div role="status" className="carte p-5 text-center">
        <Icon name="mail" size={32} color="#6C3CF0" className="mx-auto" />
        <b className="mt-2 block">Vérifie ta boîte mail</b>
        <p className="mt-1 text-[13px] text-gris">
          {sent === 'confirm' ? (
            <>Nous avons envoyé un lien à <b>{email}</b> pour confirmer ton adresse. Après, tu te connecteras toujours avec ton mot de passe.</>
          ) : (
            <>Si un compte existe pour <b>{email}</b>, tu vas recevoir un lien pour choisir un nouveau mot de passe.</>
          )}
        </p>
        <p className="mt-2 text-[12px] text-gris">Rien reçu ? Regarde dans les spams.</p>
        <button type="button" onClick={() => { setSent(''); switchTo('login'); }} className="mt-3 text-sm font-semibold text-violet-d">Retour à la connexion</button>
      </div>
    );

  return (
    <>
      {mode !== 'forgot' && (
        <div className="mb-4 grid grid-cols-2 rounded-full bg-lilas p-1" role="tablist">
          {(['login', 'signup'] as const).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => switchTo(m)} className={`h-10 rounded-full text-sm font-semibold ${mode === m ? 'bg-white text-violet-d shadow-sm' : 'text-gris'}`}>
              {m === 'login' ? 'Se connecter' : 'Créer un compte'}
            </button>
          ))}
        </div>
      )}
      {mode === 'forgot' && (
        <div className="mb-3">
          <b className="block text-base">Mot de passe oublié</b>
          <small className="text-[13px] text-gris">Indique ton e-mail : tu recevras un lien pour en choisir un nouveau.</small>
        </div>
      )}
      <form onSubmit={submit} noValidate>
        {mode === 'signup' && (
          <>
            <label htmlFor="name" className="mb-2 block text-[13px] font-semibold">Prénom</label>
            <div className="champ mb-3">
              <Icon name="profile" size={19} color="#6B6585" />
              <input id="name" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton prénom" maxLength={60} />
            </div>
          </>
        )}
        <label htmlFor="email" className="mb-2 block text-[13px] font-semibold">Adresse e-mail</label>
        <div className="champ">
          <Icon name="mail" size={19} color="#6B6585" />
          <input id="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@exemple.com" />
        </div>
        {mode !== 'forgot' && (
          <>
            <label htmlFor="password" className="mb-2 mt-3 block text-[13px] font-semibold">Mot de passe</label>
            <div className="champ">
              <Icon name="lock" size={19} color="#6B6585" />
              <input id="password" type={show ? 'text' : 'password'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'signup' ? '8 caractères minimum' : 'Ton mot de passe'} />
              <button type="button" onClick={() => setShow((v) => !v)} className="text-xs font-semibold text-violet-d">{show ? 'Masquer' : 'Afficher'}</button>
            </div>
          </>
        )}
        {mode === 'login' && (
          <button type="button" onClick={() => switchTo('forgot')} className="mt-2 text-[13px] font-semibold text-violet-d">Mot de passe oublié ?</button>
        )}
        {error && <p role="alert" className="mt-2 text-[13px] text-[#B23A1E]">{error}</p>}
        <button type="submit" className="btn-violet mt-3.5 w-full" disabled={busy}>
          {busy ? 'Un instant…' : mode === 'login' ? 'Se connecter' : mode === 'signup' ? 'Créer mon compte' : 'Recevoir le lien'}
        </button>
        {mode === 'forgot' && (
          <button type="button" onClick={() => switchTo('login')} className="mt-3 w-full text-sm font-semibold text-violet-d">Retour à la connexion</button>
        )}
      </form>
      {mode !== 'forgot' && (
        <>
          <div className="my-4 flex items-center gap-2.5">
            <span className="h-px flex-1 bg-[#E2DCF7]" />
            <small className="text-gris">ou</small>
            <span className="h-px flex-1 bg-[#E2DCF7]" />
          </div>
          <button type="button" onClick={google} className="btn-blanc w-full border-[#E2DCF7] text-encre">
            <Icon name="google" size={18} /> Continuer avec Google
          </button>
        </>
      )}
    </>
  );
}
