import Link from 'next/link';
import { getCategories, getDishes, getSession, isPlus } from '@/lib/data';
import { currentCategory, DEFAULT_TZ, greeting, localNow } from '@/lib/time';
import { DAY_GOALS, dayBalance, filterPool, isLate, LATE_TIP, loadNutriPool, rankFor, rankLate, why, type NDish } from '@/lib/nutrition';
import { weekStart } from '@/lib/week';
import { DishCard, DishImage, Page } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { FavButton } from '@/components/FavButton';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: Promise<{ autre?: string }> }) {
  const { autre } = await searchParams;
  const skip = Math.max(0, Number(autre) || 0);
  const [{ user, profile, allergies, prefs, supabase }, categories, dishes] = await Promise.all([getSession(), getCategories(), getDishes()]);
  const tz = profile?.timezone || DEFAULT_TZ;
  const now = localNow(tz);
  const cat = categories.length ? currentCategory(categories, now.hour) : null;
  // Suggestion selon les repères nutritionnels : ce qui complète le mieux la journée, pas le hasard
  const npool = filterPool(await loadNutriPool(supabase), allergies, prefs);
  let today: NDish[] = [];
  let have = new Set<string>();
  if (user) {
    const [{ data: plan }, { data: avail }] = await Promise.all([
      supabase.from('ma2_meal_plans').select('items:ma2_meal_plan_items(day, dish_id)').eq('user_id', user.id).eq('week_start', weekStart(now.isoDay)).maybeSingle(),
      supabase.from('ma2_available_ingredients').select('ingredient_id').eq('user_id', user.id),
    ]);
    const ids = ((plan?.items as { day: string; dish_id: string }[] | undefined) ?? []).filter((i) => i.day === now.isoDay).map((i) => i.dish_id);
    today = npool.filter((d) => ids.includes(d.id));
    have = new Set((avail ?? []).map((a) => a.ingredient_id as string));
  }
  const late = isLate(now.hour);
  const ranked = late ? rankLate(npool, today, { seed: now.isoDay + (user?.id ?? '') }) : cat ? rankFor(npool, cat.id, today, { have, seed: now.isoDay + (user?.id ?? '') }) : [];
  const withPhoto = ranked.filter((d) => d.image_url).slice(0, 3);
  const order = [...withPhoto, ...ranked.filter((d) => !withPhoto.includes(d))];
  const top = order.length ? order[skip % order.length] : null;
  const pick = top ? dishes.find((d) => d.id === top.id) ?? null : null;
  const reason = late ? (top ? 'Léger et facile à digérer avant de dormir' : null) : top && cat ? why(top, cat.id) : null;
  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  let favs: string[] = [];
  if (user) {
    const { data } = await supabase.from('ma2_favorites').select('dish_id').eq('user_id', user.id);
    favs = (data ?? []).map((r) => r.dish_id as string);
  }
  const name = profile?.display_name?.split(' ')[0];
  const bal = dayBalance(today);
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
              <small className="text-xs text-gris">{late ? 'Un dîner léger pour bien dormir' : 'Suggestion pour toi, maintenant'}</small>
              <h1 className="mt-0.5 text-[22px] font-extrabold leading-tight lg:text-[28px]">{pick.name}</h1>
              {late && <p className="mt-1.5 rounded-xl bg-lilas-2 px-3 py-2 text-[12.5px] text-violet-d">{LATE_TIP}</p>}
              <p className="mt-1 text-[13px] text-encre-2">{pick.description}</p>
              {reason && (
                <Link href="/equilibre" className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-emeraude">
                  <Icon name="check" size={13} color="#047857" width={2.6} /> {reason}
                </Link>
              )}
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
          <section className="carte p-6 text-center text-sm text-gris">{late ? LATE_TIP : 'Le catalogue arrive bientôt.'}</section>
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
              <p className="mb-3 mt-1.5 text-[12.5px] text-[#4a3500]">Tu hésites ? Tourne, mange, c’est réglé.</p>
              <Link href="/roue" className="inline-flex h-10 items-center rounded-full bg-white px-4 text-[13px] font-semibold">
                Tourner la roue
              </Link>
            </div>
            <img src="/kalou-bravo.svg" alt="" width={150} height={150} className="absolute -bottom-2 right-1" />
          </section>
        </div>
      </div>

      <div className="px-5 pt-4">
          <section className="carte p-4" aria-label="Ma journée">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[17px] font-extrabold">Ma journée</h2>
              <Link href="/equilibre" className="text-[12px] font-semibold text-violet-d">Les repères ›</Link>
            </div>
            {user && today.length ? (
              <>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {DAY_GOALS.map((g) => {
                    const ok = bal[g.id as 'cereales' | 'proteines' | 'legumes' | 'fruits'];
                    return (
                      <span key={g.id} className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-[12px] font-semibold ${ok ? 'bg-emeraude-l text-emeraude' : 'bg-soleil-l text-[#8A5A00]'}`}>
                        <Icon name={ok ? 'check' : 'alert'} size={13} width={2.6} /> {g.label}
                      </span>
                    );
                  })}
                </div>
                {(bal.sweet > 1 || bal.fried > 1) && <p className="mt-2 text-[12px] text-corail">Attention : {bal.sweet > 1 ? 'plusieurs plats sucrés' : 'plusieurs plats frits'} aujourd’hui.</p>}
                <Link href="/planning" className="mt-3 inline-flex h-10 items-center rounded-full bg-lilas-2 px-4 text-[13px] font-semibold text-violet-d">Voir mes repas du jour</Link>
              </>
            ) : (
              <>
                <p className="text-[13px] text-encre-2">Ajoute tes repas d’aujourd’hui à ton planning : tu verras ce qui manque pour une journée équilibrée.</p>
                <Link href={user ? '/planning' : '/connexion'} className="mt-3 inline-flex h-10 items-center rounded-full bg-violet px-4 text-[13px] font-semibold text-white">{user ? 'Remplir ma journée' : 'Se connecter'}</Link>
              </>
            )}
          </section>
      </div>

      <section className="grid gap-3 px-5 pt-4 sm:grid-cols-3">
        <Link href="/assistant" className="relative flex items-center gap-3 overflow-hidden rounded-[22px] bg-violet p-4 text-white sm:col-span-1">
          <img src="/kalou-joie.svg" alt="" width={52} height={52} className="flex-none" />
          <span className="min-w-0">
            <b className="block text-[15px]">Kalou, mon assistant</b>
            <small className="block text-[12px] opacity-90">{isPlus(profile) ? 'Ma journée, mes courses, mes rappels' : 'Repas, courses et rappels préparés pour toi'}</small>
          </span>
          {!isPlus(profile) && <span className="absolute right-3 top-3 rounded-full bg-[#FFD54A] px-2 py-0.5 text-[10px] font-bold text-encre">PLUS</span>}
        </Link>
        <Link href="/menus" className="carte flex items-center gap-3 p-4">
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-[#8E3CC9]"><Icon name="bowl" size={22} color="#fff" width={2.2} /></span>
          <span><b className="block text-[15px]">Les menus</b><small className="text-[12px] text-gris">Modernes, fête, petit budget…</small></span>
        </Link>
        <Link href="/restaurants" className="carte flex items-center gap-3 p-4">
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-[#1F2A22]"><Icon name="market" size={22} color="#fff" width={2.2} /></span>
          <span><b className="block text-[15px]">Restaurants</b><small className="text-[12px] text-gris">Où manger près de moi</small></span>
        </Link>
      </section>

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
