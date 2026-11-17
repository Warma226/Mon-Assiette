import Link from 'next/link';
import type { Metadata } from 'next';
import { plusSession } from '@/lib/plus';
import { Empty, Page, TopBar } from '@/components/ui';
import { Notice } from '@/components/Notice';
import { PlusGate } from '@/components/PlusGate';
import { PushToggle } from '@/components/PushToggle';
import { addReminder, deleteReminder, toggleReminder } from '../assistant/actions';

export const metadata: Metadata = { title: 'Mes rappels' };
export const dynamic = 'force-dynamic';
const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const KIND: [string, string][] = [['repas', 'Repas'], ['eau', 'Boire de l’eau'], ['decongeler', 'Décongeler la viande'], ['marche', 'Aller au marché'], ['autre', 'Autre']];

export default async function Rappels({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { ok, err } = await searchParams;
  const { user, supabase, plus } = await plusSession();
  if (!user || !plus)
    return (
      <Page>
        <TopBar title="Mes rappels" back="/assistant" />
        <div className="px-5">
          {!user ? (
            <Empty title="Tes rappels" text="Connecte-toi d’abord." action={<Link href="/connexion?suite=profil" className="btn-violet h-11 text-sm">Se connecter</Link>} />
          ) : (
            <PlusGate title="Kalou te rappelle l’essentiel" text="L’heure du repas, un verre d’eau, sortir la viande du congélateur la veille, le jour de marché : une notification au bon moment." />
          )}
        </div>
      </Page>
    );
  const { data } = await supabase.from('ma2_reminders').select('id, kind, label, at_time, days, enabled').eq('user_id', user.id).order('at_time');
  const rows = data ?? [];
  return (
    <Page>
      <TopBar title="Mes rappels" back="/assistant" />
      <div className="px-5">
        <Notice ok={ok} err={err} />
        <PushToggle />
        <div className="carte">
          {rows.length === 0 && <p className="p-4 text-[13px] text-gris">Aucun rappel pour l’instant.</p>}
          {rows.map((r, i) => (
            <div key={r.id} className={`flex items-center gap-3 px-4 py-3 ${i ? 'border-t border-[#f0ecfb]' : ''} ${r.enabled ? '' : 'opacity-50'}`}>
              <b className="w-14 flex-none text-lg">{String(r.at_time).slice(0, 5)}</b>
              <span className="min-w-0 flex-1">
                <b className="block truncate text-sm">{r.label}</b>
                <small className="text-xs text-gris">{r.days.length === 7 ? 'Tous les jours' : r.days.map((d: number) => ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'][d - 1]).join(', ')}</small>
              </span>
              <form action={toggleReminder}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="enabled" value={r.enabled ? '0' : '1'} />
                <button className="pastille">{r.enabled ? 'Pause' : 'Activer'}</button>
              </form>
              <form action={deleteReminder}><input type="hidden" name="id" value={r.id} /><button aria-label="Supprimer" className="text-gris">✕</button></form>
            </div>
          ))}
        </div>
        <form action={addReminder} className="carte mt-4 p-4">
          <b className="mb-2 block text-sm">Nouveau rappel</b>
          <div className="flex gap-2">
            <label className="champ h-11 flex-1"><span className="sr-only">Type</span>
              <select name="kind" defaultValue="repas">{KIND.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            </label>
            <label className="champ h-11 w-28 flex-none"><span className="sr-only">Heure</span><input type="time" name="at" defaultValue="12:30" required /></label>
          </div>
          <label className="champ mt-2 h-11"><span className="sr-only">Texte</span><input name="label" maxLength={80} placeholder="Texte du rappel (facultatif)" /></label>
          <div className="mt-3 flex gap-1.5">
            {DAYS.map((d, i) => (
              <label key={i} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-lilas text-xs font-semibold has-[:checked]:bg-violet has-[:checked]:text-white">
                <input type="checkbox" name="days" value={i + 1} defaultChecked className="sr-only" />
                {d}
              </label>
            ))}
          </div>
          <button className="btn-violet mt-3 h-11 w-full text-sm">Ajouter le rappel</button>
        </form>
        <p className="mt-3 text-[11.5px] text-gris">Les rappels suivent l’heure de ton fuseau (Ouagadougou par défaut, modifiable dans ton profil).</p>
      </div>
    </Page>
  );
}
