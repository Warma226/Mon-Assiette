import Link from 'next/link';
import type { Metadata } from 'next';
import { DEFAULT_TZ } from '@/lib/time';
import { addDays, todayIso, weekStart } from '@/lib/week';
import { plusSession, SHELVES } from '@/lib/plus';
import { Empty, Page, TopBar } from '@/components/ui';
import { Notice } from '@/components/Notice';
import { PlusGate } from '@/components/PlusGate';
import { ShoppingList } from '@/components/ShoppingList';
import { addShopping, buildShopping, clearChecked } from '../assistant/actions';

export const metadata: Metadata = { title: 'Mes courses' };
export const dynamic = 'force-dynamic';

const fmt = (iso: string) => new Date(iso + 'T12:00:00Z').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' });

export default async function Courses({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string; jour?: string }> }) {
  const { ok, err, jour } = await searchParams;
  const { user, profile, supabase, plus } = await plusSession();
  if (!user || !plus)
    return (
      <Page>
        <TopBar title="Mes courses" back="/assistant" />
        <div className="px-5">
          {!user ? (
            <Empty title="Ta liste de courses" text="Connecte-toi pour créer ta liste." action={<Link href="/connexion?suite=profil" className="btn-violet h-11 text-sm">Se connecter</Link>} />
          ) : (
            <PlusGate title="La liste de courses se fait toute seule" text="Kalou lit ton planning de la semaine, retire ce que tu as déjà à la maison et range le reste par rayon. Tu coches au marché et tu partages la liste par WhatsApp." />
          )}
        </div>
      </Page>
    );
  const today = todayIso(profile?.timezone || DEFAULT_TZ);
  const ws = weekStart(jour && /^\d{4}-\d{2}-\d{2}$/.test(jour) ? jour : today);
  const { data } = await supabase.from('ma2_shopping_items').select('id, label, shelf, dishes, checked').eq('user_id', user.id).eq('week_start', ws).order('label');
  const items = data ?? [];
  return (
    <Page>
      <TopBar title="Mes courses" back="/assistant" />
      <div className="px-5">
        <Notice ok={ok} err={err} />
        <div className="mb-3 flex items-center justify-between">
          <Link href={`/courses?jour=${addDays(ws, -7)}`} className="pastille bg-white">‹</Link>
          <b className="text-sm">Semaine du {fmt(ws)}</b>
          <Link href={`/courses?jour=${addDays(ws, 7)}`} className="pastille bg-white">›</Link>
        </div>
        <form action={buildShopping} className="mb-4">
          <input type="hidden" name="day" value={ws} />
          <button className="btn-violet w-full">{items.some((i) => i) ? 'Mettre à jour depuis mon planning' : 'Créer ma liste depuis mon planning'}</button>
        </form>
        {items.length ? (
          <ShoppingList items={items} shelves={SHELVES} />
        ) : (
          <p className="carte p-4 text-center text-[13px] text-gris">Ta liste est vide. Prépare ton planning, puis crée la liste en un clic.</p>
        )}
        <form action={addShopping} className="mt-3 flex gap-2">
          <input type="hidden" name="ws" value={ws} />
          <label className="champ h-11 flex-1"><span className="sr-only">Ajouter un article</span><input name="label" maxLength={80} placeholder="Ajouter un article (savon, pain…)" required /></label>
          <button className="btn-blanc h-11 px-4 text-sm">Ajouter</button>
        </form>
        {items.some((i) => i.checked) && (
          <form action={clearChecked} className="mt-3 text-center">
            <input type="hidden" name="ws" value={ws} />
            <button className="text-[12.5px] text-violet-d underline">Retirer les articles cochés</button>
          </form>
        )}
      </div>
    </Page>
  );
}
