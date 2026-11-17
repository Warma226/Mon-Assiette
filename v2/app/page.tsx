import Link from 'next/link';
import { getCategories, getDishes, getSession } from '@/lib/data';
import { currentCategory, DEFAULT_TZ, greeting, localNow, suggest } from '@/lib/time';
import { DishCard, DishImage, Page } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { FavButton } from '@/components/FavButton';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: Promise<{ autre?: string }> }) {
  const { autre } = await searchParams;
  const skip = Math.max(0, Number(autre) || 0);
  const [{ user, profile, allergies, supabase }, categories, dishes] = await Promise.all([getSession(), getCategories(), getDishes()]);
  const tz = profile?.timezone || DEFAULT_TZ;
  const now = localNow(tz);
  const cat = categories.length ? currentCategory(categories, now.hour) : null;
  const pick = cat ? suggest(dishes, cat.id, allergies, now.isoDay + (user?.id ?? ''), skip) : null;
  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  let favs: string[] = [];
  if (user) {
    const { data } = await supabase.from('ma2_favorites').select('dish_id').eq('user_id', user.id);
    favs = (data ?? []).map((r) => r.dish_id as string);
  }
  const name = profile?.display_name?.split(' ')[0];
  const others = dishes.filter((d) => d.id !== pick?.id && d.image_url).slice(0, 6);

  return (
    <Page wide>
      <header className="flex items-center gap-3 px-5 pb-2 pt-5">
        <Link href="/profil" className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-full bg-lilas-2 text-[17px] font-bold text-violet-d" aria-label="Mon profil">
          {(name?.[0] ?? 'M').toUpperCase()}
        </Link>
        <div className="flex-1">
          <small className="block text-xs text-gris">
            {greeting(now.hour)} · <span className="capitalize">{now.label}</span>
          </small>
          <b className="block text-lg leading-tight">{name ?? 'Bienvenue'}</b>
        </div>
        {!user && (
          <Link href="/connexion" className="pastille bg-white font-semibold text-violet-d">
            Se connecter
          </Link>
        )}
      </header>

      <div className="grid gap-4 px-5 pt-2.5 lg:grid-cols-[2fr_1fr]">
        {pick ? (
          <section className="carte overflow-hidden lg:flex" aria-label="Suggestion du moment">
            <div className="relative lg:w-1/2">
              <DishImage dish={pick} rounded="rounded-none" className="h-[200px] w-full lg:h-full lg:min-h-[280px]" />
              <span className="absolute left-3 top-3 flex h-[30px] items-center gap-1.5 rounded-full bg-violet px-3 text-xs font-semibold text-white">
                <Icon name="clock" size={13} color="#fff" width={2.4} /> {cat?.name} · {now.time}
              </span>
              <div className="absolute right-2.5 top-2.5">
                <FavButton dishId={pick.id} initial={favs.includes(pick.id)} loggedIn={!!user} />
              </div>
            </div>
            <div className="p-4 lg:w-1/2 lg:p-6">
              <small className="text-xs text-gris">Suggestion pour toi, maintenant</small>
              <h1 className="mt-0.5 text-[22px] font-extrabold leading-tight lg:text-[28px]">{pick.name}</h1>
              <p className="mt-1 text-[13px] text-encre-2">{pick.description}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {pick.prep_minutes ? (
                  <span className="pastille">
                    <Icon name="clock" size={13} color="#8E6CF5" /> {pick.prep_minutes} min
                  </span>
                ) : null}
                {pick.community && <span className="pastille">Cuisine {pick.community.toLowerCase()}</span>}
                <span className="pastille">{catName[pick.category_id]}</span>
              </div>
              <div className="mt-3.5 flex flex-wrap gap-2">
                <Link href={`/plat/${pick.slug}`} className="btn-violet h-11 flex-1 text-sm">
                  Voir la recette
                </Link>
                <Link href={`/?autre=${skip + 1}`} scroll={false} className="btn-blanc h-11 flex-1 text-sm text-encre">
                  <Icon name="send" size={15} /> Autre idée
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="carte p-6 text-center text-sm text-gris">Le catalogue arrive bientôt.</section>
        )}

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <Link href="/planning" className="tuile bg-violet">
              <span className="tuile-ic"><Icon name="plan" size={24} color="#fff" width={2.2} /></span>Mon planning
            </Link>
            <Link href="/favoris" className="tuile bg-emeraude">
              <span className="tuile-ic"><Icon name="heart" size={24} color="#fff" width={2.2} /></span>Favoris
            </Link>
            <Link href="/ingredients" className="tuile bg-corail">
              <span className="tuile-ic"><Icon name="bowl" size={24} color="#fff" width={2.2} /></span>Mes ingrédients
            </Link>
          </div>
          <section className="relative h-40 overflow-hidden rounded-3xl bg-gradient-to-br from-[#ffd54a] to-[#ffa51f] p-5 lg:h-auto lg:flex-1">
            <span className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/20" />
            <div className="relative max-w-[190px]">
              <h2 className="text-[23px] font-extrabold leading-tight">La roue de Kalou</h2>
              <p className="mb-3 mt-1.5 text-[12.5px] text-[#4a3500]">Tu hésites ? Kalou choisit pour toi.</p>
              <Link href="/roue" className="inline-flex h-10 items-center rounded-full bg-white px-4 text-[13px] font-semibold">
                Tourner la roue
              </Link>
            </div>
            <img src="/kalou-bravo.svg" alt="" width={150} height={150} className="absolute -bottom-2 right-1" />
          </section>
        </div>
      </div>

      <section className="px-5">
        <div className="mb-3 mt-6 flex items-center justify-between">
          <h2 className="titre-sec">Découvrir</h2>
          <Link href="/decouvrir" aria-label="Tout voir" className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
            <Icon name="next" size={18} />
          </Link>
        </div>
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0">
          {others.map((d) => (
            <div key={d.id} className="w-[150px] flex-none lg:w-auto">
              <DishCard dish={d} categoryName={catName[d.category_id]} />
            </div>
          ))}
        </div>
      </section>
    </Page>
  );
}
