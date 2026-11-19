import Link from 'next/link';
import type { Metadata } from 'next';
import { DEFAULT_TZ } from '@/lib/time';
import { addDays, todayIso, weekStart } from '@/lib/week';
import { plusSession } from '@/lib/plus';
import { Empty, Page, TopBar } from '@/components/ui';
import { Notice } from '@/components/Notice';
import { PlusGate } from '@/components/PlusGate';
import { addExpense, deleteExpense } from '../assistant/actions';

export const metadata: Metadata = { title: 'Mon budget' };
export const dynamic = 'force-dynamic';
const F = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F';

export default async function Budget({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { ok, err } = await searchParams;
  const { user, profile, supabase, plus } = await plusSession();
  if (!user || !plus)
    return (
      <Page>
        <TopBar title="Mon budget" back="/assistant" />
        <div className="px-5">
          {!user ? (
            <Empty title="Suis ton budget nourriture" text="Connecte-toi d’abord." action={<Link href="/connexion?suite=profil" className="btn-violet h-11 text-sm">Se connecter</Link>} />
          ) : (
            <PlusGate title="Garde la main sur ton budget" text="Note tes achats en 2 secondes, vois ce qu’il te reste pour la semaine et sois alerté avant de dépasser." />
          )}
        </div>
      </Page>
    );
  const today = todayIso(profile?.timezone || DEFAULT_TZ);
  const ws = weekStart(today);
  const { data } = await supabase.from('ma2_budget_entries').select('id, day, amount, label').eq('user_id', user.id).gte('day', ws).lte('day', addDays(ws, 6)).order('day', { ascending: false }).order('created_at', { ascending: false });
  const rows = data ?? [];
  const spent = rows.reduce((s, r) => s + r.amount, 0);
  const weekly = profile?.budget_amount ? (profile.budget_period === 'semaine' ? profile.budget_amount : profile.budget_amount * 7) : null;
  const pct = weekly ? Math.min(100, Math.round((spent / weekly) * 100)) : 0;
  const over = weekly !== null && spent > weekly;
  const warn = weekly !== null && !over && pct >= 80;
  return (
    <Page>
      <TopBar title="Mon budget" back="/assistant" />
      <div className="px-5">
        <Notice ok={ok} err={err} />
        <section className={`rounded-[26px] p-5 text-white ${over ? 'bg-corail' : 'bg-gradient-to-br from-[#1F2A22] to-[#3A4A3E]'}`}>
          <small className="text-[12px] opacity-85">Dépensé cette semaine</small>
          <b className="block text-[30px] leading-tight">{F(spent)}</b>
          {weekly ? (
            <>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/20"><div className={`h-full rounded-full ${over ? 'bg-white' : warn ? 'bg-[#FFD54A]' : 'bg-[#6EE7B7]'}`} style={{ width: `${pct}%` }} /></div>
              <small className="mt-2 block text-[12.5px] opacity-90">
                {over ? `Budget dépassé de ${F(spent - weekly)}` : `Reste ${F(weekly - spent)} sur ${F(weekly)}`}
                {warn ? ' · attention, tu approches de la limite' : ''}
              </small>
            </>
          ) : (
            <small className="mt-2 block text-[12.5px] opacity-90">
              Indique ton budget dans <Link href="/profil" className="underline">ton profil</Link> pour suivre ce qu’il te reste.
            </small>
          )}
        </section>
        <form action={addExpense} className="carte mt-4 p-4">
          <b className="mb-2 block text-sm">Noter une dépense</b>
          <div className="flex gap-2">
            <label className="champ h-11 w-32 flex-none"><span className="sr-only">Montant</span><input name="amount" inputMode="numeric" pattern="[0-9 ]*" required placeholder="Montant" /></label>
            <label className="champ h-11 flex-1"><span className="sr-only">Pour quoi</span><input name="label" maxLength={80} placeholder="Pour quoi ? (marché…)" /></label>
          </div>
          <input type="hidden" name="day" value={today} />
          <button className="btn-violet mt-2.5 h-11 w-full text-sm">Ajouter</button>
        </form>
        <h2 className="titre-sec mb-2 mt-5">Cette semaine</h2>
        <div className="carte">
          {rows.length === 0 && <p className="p-4 text-[13px] text-gris">Aucune dépense notée.</p>}
          {rows.map((r, i) => (
            <div key={r.id} className={`flex items-center gap-3 px-4 py-3 ${i ? 'border-t border-[#f0ecfb]' : ''}`}>
              <span className="min-w-0 flex-1">
                <b className="block truncate text-sm">{r.label || 'Dépense'}</b>
                <small className="text-xs capitalize text-gris">{new Date(r.day + 'T12:00:00Z').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', timeZone: 'UTC' })}</small>
              </span>
              <b className="text-sm">{F(r.amount)}</b>
              <form action={deleteExpense}><input type="hidden" name="id" value={r.id} /><button aria-label="Supprimer" className="text-gris">✕</button></form>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}
