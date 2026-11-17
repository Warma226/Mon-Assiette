import Link from 'next/link';
import type { Metadata } from 'next';
import { plusSession } from '@/lib/plus';
import { Empty, Page, TopBar } from '@/components/ui';
import { Restaurants } from '@/components/Restaurants';

export const metadata: Metadata = { title: 'Restaurants autour de moi' };
export const dynamic = 'force-dynamic';

export default async function RestaurantsPage({ searchParams }: { searchParams: Promise<{ plat?: string }> }) {
  const { plat } = await searchParams;
  const { user, supabase, plus } = await plusSession();
  if (!user)
    return (
      <Page>
        <TopBar title="Restaurants" />
        <div className="px-5">
          <Empty title="Où manger près de toi ?" text="Connecte-toi (c’est gratuit) pour voir les restaurants autour de toi." action={<Link href="/connexion?suite=profil" className="btn-violet h-11 text-sm">Se connecter</Link>} />
        </div>
      </Page>
    );
  const { data } = plus ? await supabase.from('ma2_restaurant_favorites').select('place_id, name').eq('user_id', user.id).order('created_at', { ascending: false }) : { data: [] };
  const favs = data ?? [];
  return (
    <Page>
      <TopBar title="Restaurants" />
      <div className="px-5">
        <Restaurants plus={plus} favorites={favs.map((f) => f.place_id)} initialQuery={plus ? (plat ?? '').slice(0, 80) : ''} />
        {plus && favs.length > 0 && (
          <>
            <h2 className="titre-sec mb-2 mt-6">Mes restaurants favoris</h2>
            <div className="carte">
              {favs.map((f, i) => (
                <a key={f.place_id} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.name)}&query_place_id=${encodeURIComponent(f.place_id)}`} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-between px-4 py-3 text-sm ${i ? 'border-t border-[#f0ecfb]' : ''}`}>
                  <b>{f.name}</b>
                  <span className="text-xs text-violet-d">Ouvrir ›</span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </Page>
  );
}
