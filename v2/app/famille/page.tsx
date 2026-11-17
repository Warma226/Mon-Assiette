import Link from 'next/link';
import type { Metadata } from 'next';
import { getPreferences } from '@/lib/data';
import { plusSession } from '@/lib/plus';
import { Empty, Page, TopBar } from '@/components/ui';
import { Notice } from '@/components/Notice';
import { PlusGate } from '@/components/PlusGate';
import { addMember, deleteMember } from '../assistant/actions';

export const metadata: Metadata = { title: 'Ma famille' };
export const dynamic = 'force-dynamic';
const KIND: Record<string, string> = { adulte: 'Adulte', enfant: 'Enfant', bebe: 'Bébé' };

export default async function Famille({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { ok, err } = await searchParams;
  const [{ user, supabase, plus }, prefs] = await Promise.all([plusSession(), getPreferences()]);
  if (!user || !plus)
    return (
      <Page>
        <TopBar title="Ma famille" back="/assistant" />
        <div className="px-5">
          {!user ? (
            <Empty title="Ta famille" text="Connecte-toi d’abord." action={<Link href="/connexion?suite=profil" className="btn-violet h-11 text-sm">Se connecter</Link>} />
          ) : (
            <PlusGate title="Des repas pour toute la famille" text="Ajoute chaque membre du foyer avec ses allergies : Kalou ne proposera que des plats que tout le monde peut manger." />
          )}
        </div>
      </Page>
    );
  const { data } = await supabase.from('ma2_household_members').select('id, name, kind, allergies').eq('user_id', user.id).order('created_at');
  const members = data ?? [];
  const allergens = prefs.filter((p) => p.kind === 'allergie');
  const label = Object.fromEntries(prefs.map((p) => [p.id, p.name]));
  return (
    <Page>
      <TopBar title="Ma famille" back="/assistant" />
      <div className="px-5">
        <Notice ok={ok} err={err} />
        <p className="mb-3 text-[13px] text-gris">Toi, plus {members.length} personne{members.length > 1 ? 's' : ''}. Les allergies de chacun sont exclues des repas proposés.</p>
        <div className="carte">
          {members.length === 0 && <p className="p-4 text-[13px] text-gris">Personne pour l’instant.</p>}
          {members.map((m, i) => (
            <div key={m.id} className={`flex items-center gap-3 px-4 py-3 ${i ? 'border-t border-[#f0ecfb]' : ''}`}>
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-lilas-2 font-bold text-violet-d">{m.name[0]?.toUpperCase()}</span>
              <span className="min-w-0 flex-1">
                <b className="block truncate text-sm">{m.name}</b>
                <small className="block truncate text-xs text-gris">{KIND[m.kind]}{m.allergies.length ? ` · sans ${m.allergies.map((a: string) => (label[a] ?? a).toLowerCase()).join(', ')}` : ''}</small>
              </span>
              <form action={deleteMember}><input type="hidden" name="id" value={m.id} /><button aria-label={`Retirer ${m.name}`} className="text-gris">✕</button></form>
            </div>
          ))}
        </div>
        <form action={addMember} className="carte mt-4 p-4">
          <b className="mb-2 block text-sm">Ajouter quelqu’un</b>
          <div className="flex gap-2">
            <label className="champ h-11 flex-1"><span className="sr-only">Prénom</span><input name="name" maxLength={40} required placeholder="Prénom" /></label>
            <label className="champ h-11 w-32 flex-none">
              <span className="sr-only">Âge</span>
              <select name="kind" defaultValue="adulte"><option value="adulte">Adulte</option><option value="enfant">Enfant</option><option value="bebe">Bébé</option></select>
            </label>
          </div>
          <small className="mb-1.5 mt-3 block text-xs font-semibold">Allergies</small>
          <div className="flex flex-wrap gap-2">
            {allergens.map((a) => (
              <label key={a.id} className="pastille cursor-pointer has-[:checked]:bg-violet has-[:checked]:text-white">
                <input type="checkbox" name="allergies" value={a.id} className="sr-only" />
                {a.name}
              </label>
            ))}
          </div>
          <button className="btn-violet mt-3 h-11 w-full text-sm">Ajouter</button>
        </form>
        <p className="mt-3 text-[11.5px] text-gris">Pour les bébés et les enfants avec une allergie, demande toujours l’avis d’un professionnel de santé.</p>
      </div>
    </Page>
  );
}
