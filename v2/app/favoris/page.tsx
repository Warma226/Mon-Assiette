import Link from 'next/link';
import type { Metadata } from 'next';
import { getCategories, getSession, type Dish } from '@/lib/data';
import { DishImage, Empty, Page, TopBar } from '@/components/ui';
import { FavButton } from '@/components/FavButton';

export const metadata: Metadata = { title: 'Mes favoris' };
export const dynamic = 'force-dynamic';

export default async function Favoris() {
  const [{ user, supabase }, categories] = await Promise.all([getSession(), getCategories()]);
  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  if (!user)
    return (
      <Page>
        <TopBar title="Mes favoris" />
        <div className="px-5">
          <Empty title="Garde tes plats préférés" text="Connecte-toi pour enregistrer tes favoris et les retrouver partout." action={<Link href="/connexion?suite=favoris" className="btn-violet h-11 text-sm">Se connecter</Link>} />
        </div>
      </Page>
    );
  const { data } = await supabase.from('ma2_favorites').select('created_at, dish:ma2_dishes(id, slug, name, image_url, category_id, prep_minutes)').eq('user_id', user.id).order('created_at', { ascending: false });
  const favs = ((data ?? []) as unknown as { dish: Dish | null }[]).map((r) => r.dish).filter((d): d is Dish => !!d);
  return (
    <Page>
      <TopBar title="Mes favoris" />
      <div className="px-5">
        {!favs.length ? (
          <Empty title="Aucun favori pour l’instant" text="Touche le cœur sur un plat pour le retrouver ici." action={<Link href="/decouvrir" className="btn-violet h-11 text-sm">Découvrir des plats</Link>} />
        ) : (
          <div className="grid gap-2.5 lg:grid-cols-2">
            {favs.map((d) => (
              <Link key={d.id} href={`/plat/${d.slug}`} className="carte flex items-center gap-3 p-3">
                <DishImage dish={d} className="h-[70px] w-[70px] flex-none" />
                <span className="min-w-0 flex-1">
                  <b className="block text-[14.5px]">{d.name}</b>
                  <small className="text-xs text-gris">{catName[d.category_id]}</small>
                </span>
                <FavButton dishId={d.id} initial loggedIn />
              </Link>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}
