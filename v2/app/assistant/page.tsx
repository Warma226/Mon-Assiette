import Link from 'next/link';
import type { Metadata } from 'next';
import { getCategories } from '@/lib/data';
import { DEFAULT_TZ, greeting, localNow } from '@/lib/time';
import { weekStart } from '@/lib/week';
import { plusSession } from '@/lib/plus';
import { DishImage, Empty, Page, TopBar } from '@/components/ui';
import { Icon, type IconName } from '@/components/Icon';
import { Notice } from '@/components/Notice';
import { PLUS_PERKS, PlusGate } from '@/components/PlusGate';
import { preparePlan, resetDay } from './actions';
import { DAY_GOALS, dayBalance, loadNutriPool } from '@/lib/nutrition';

export const metadata: Metadata = { title: 'Kalou, mon assistant' };
export const dynamic = 'force-dynamic';

const SHORTCUTS: [string, IconName, string, string][] = [
  ['/kalou', 'send', 'Demander à Kalou', 'bg-violet'],
  ['/courses', 'cart', 'Mes courses', 'bg-emeraude'],
  ['/budget', 'wallet', 'Mon budget', 'bg-[#B7791F]'],
  ['/rappels', 'bell', 'Mes rappels', 'bg-corail'],
  ['/famille', 'users', 'Ma famille', 'bg-[#2F6FD6]'],
  ['/menus', 'bowl', 'Les menus', 'bg-[#8E3CC9]'],
  ['/restaurants', 'market', 'Restaurants', 'bg-[#1F2A22]'],
  ['/planning', 'plan', 'Mon planning', 'bg-[#5A4FCF]'],
];

export default async function Assistant({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { ok, err } = await searchParams;
  const { user, profile, supabase, plus } = await plusSession();
  if (!user)
    return (
      <Page>
        <TopBar title="Mon assistant" />
        <div className="px-5">
          <Empty title="Kalou, ton assistant du quotidien" text="Connecte-toi pour que Kalou prépare tes repas, tes courses et tes rappels." action={<Link href="/connexion?suite=profil" className="btn-violet h-11 text-sm">Se connecter</Link>} />
        </div>
      </Page>
    );
  if (!plus)
    return (
      <Page>
        <TopBar title="Mon assistant" />
        <div className="px-5">
          <PlusGate title="Kalou s’occupe de tes repas" text="Avec Plus, Kalou devient ton assistant du quotidien :" perks={PLUS_PERKS} />
          <h2 className="titre-sec mb-3 mt-6">Gratuit pour tous</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/menus" className="carte flex items-center gap-3 p-4"><Icon name="bowl" size={20} color="#6C3CF0" /><b className="text-sm">Menu découverte</b></Link>
            <Link href="/restaurants" className="carte flex items-center gap-3 p-4"><Icon name="market" size={20} color="#6C3CF0" /><b className="text-sm">Restaurants</b></Link>
          </div>
        </div>
      </Page>
    );

  const tz = profile?.timezone || DEFAULT_TZ;
  const now = localNow(tz);
  const today = now.isoDay;
  const [categories, npool, { data: plan }] = await Promise.all([
    getCategories(),
    loadNutriPool(supabase),
    supabase.from('ma2_meal_plans').select('items:ma2_meal_plan_items(id, day, category_id, dish_id, dish:ma2_dishes(slug, name, image_url, category_id, prep_minutes))').eq('user_id', user.id).eq('week_start', weekStart(today)).maybeSingle(),
  ]);
  type It = { id: string; day: string; category_id: string; dish_id: string; dish: { slug: string; name: string; image_url: string | null; category_id: string; prep_minutes: number | null } | null };
  const all = (plan?.items as unknown as It[]) ?? [];
  const items = all.filter((i) => i.day === today);
  const weekCount = all.length;
  const bal = dayBalance(npool.filter((d) => items.some((i) => i.dish_id === d.id)));
  const name = profile?.display_name?.split(' ')[0];

  return (
    <Page wide>
      <TopBar title="Mon assistant" right={<span className="pastille bg-[#FFD54A] font-bold text-encre">PLUS</span>} />
      <div className="px-5">
        <Notice ok={ok} err={err} />
        <section className="relative overflow-hidden rounded-[26px] bg-violet p-5 text-white">
          <span className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10" />
          <img src="/kalou-joie.svg" alt="" width={92} height={92} className="absolute -bottom-2 right-2" />
          <small className="relative text-[12px] opacity-85 capitalize">{now.label}</small>
          <h1 className="relative mt-0.5 max-w-[78%] text-[21px] font-extrabold leading-tight">
            {greeting(now.hour)}{name ? ` ${name}` : ''} ! {items.length ? 'Voici ta journée.' : 'Je prépare ta journée ?'}
          </h1>
          <div className="relative mt-3 flex flex-wrap gap-2">
            {items.length === 0 ? (
              <form action={preparePlan}>
                <input type="hidden" name="scope" value="jour" />
                <input type="hidden" name="day" value={today} />
                <button className="btn-soleil h-10 text-[13px]"><Icon name="sun" size={15} width={2.4} /> Préparer ma journée</button>
              </form>
            ) : (
              <form action={resetDay}>
                <input type="hidden" name="day" value={today} />
                <button className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white/15 px-4 text-[13px] font-semibold"><Icon name="send" size={14} color="#fff" /> Autres idées</button>
              </form>
            )}
            <form action={preparePlan}>
              <input type="hidden" name="scope" value="semaine" />
              <input type="hidden" name="day" value={today} />
              <button className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-semibold text-violet-d"><Icon name="plan" size={14} /> {weekCount ? 'Compléter ma semaine' : 'Préparer ma semaine'}</button>
            </form>
          </div>
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <section>
            <h2 className="titre-sec mb-3">Ma journée</h2>
            <div className="carte">
              {categories.map((c, i) => {
                const it = items.find((x) => x.category_id === c.id);
                return (
                  <div key={c.id} className={`flex items-center gap-3 px-4 py-3 ${i ? 'border-t border-[#f0ecfb]' : ''}`}>
                    <small className="w-[86px] flex-none text-xs font-semibold text-gris">{c.name}</small>
                    {it?.dish ? (
                      <Link href={`/plat/${it.dish.slug}`} className="flex min-w-0 flex-1 items-center gap-3">
                        <DishImage dish={it.dish} className="h-11 w-11 flex-none" rounded="rounded-xl" />
                        <b className="truncate text-sm">{it.dish.name}</b>
                      </Link>
                    ) : (
                      <span className="flex-1 text-[13px] text-gris">—</span>
                    )}
                  </div>
                );
              })}
            </div>
            {items.length > 0 && (
              <div className="carte mt-3 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <b className="text-sm">Équilibre de la journée</b>
                  <Link href="/equilibre" className="text-[12px] font-semibold text-violet-d">Les repères ›</Link>
                </div>
                <div className="grid grid-cols-2 gap-2">
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
              </div>
            )}
            <p className="mt-2 text-[11.5px] text-gris">Kalou suit les repères de l’OMS et des guides alimentaires d’Afrique de l’Ouest, et tient compte des allergies de toute la famille, de tes préférences et de ce que tu as à la maison.</p>
          </section>
          <section>
            <h2 className="titre-sec mb-3">Mes outils</h2>
            <div className="grid grid-cols-4 gap-2.5 lg:grid-cols-2">
              {SHORTCUTS.map(([href, ic, label, bg]) => (
                <Link key={href} href={href} className="flex flex-col items-center gap-1.5 text-center text-[11.5px] font-semibold lg:flex-row lg:rounded-[22px] lg:bg-white lg:shadow-[0_6px_20px_rgba(76,46,170,0.07)] lg:p-3 lg:text-left lg:text-sm">
                  <span className={`flex h-12 w-12 flex-none items-center justify-center rounded-2xl ${bg}`}><Icon name={ic} size={21} color="#fff" width={2.2} /></span>
                  {label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Page>
  );
}
