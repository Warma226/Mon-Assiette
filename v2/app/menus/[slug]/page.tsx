import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCategories } from '@/lib/data';
import { DEFAULT_TZ } from '@/lib/time';
import { todayIso } from '@/lib/week';
import { plusSession } from '@/lib/plus';
import { DishImage, Page, TopBar } from '@/components/ui';
import { Notice } from '@/components/Notice';
import { PlusGate } from '@/components/PlusGate';
import { applyMenu } from '../../assistant/actions';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { supabase } = await plusSession();
  const { data } = await supabase.from('ma2_menus').select('title').eq('slug', slug).maybeSingle();
  return { title: data?.title ?? 'Menu' };
}

const JOURS = ['', 'Jour 1', 'Jour 2', 'Jour 3', 'Jour 4', 'Jour 5', 'Jour 6', 'Jour 7'];

export default async function Menu({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ ok?: string; err?: string }> }) {
  const [{ slug }, { ok, err }] = await Promise.all([params, searchParams]);
  const [{ supabase, user, profile, plus }, categories] = await Promise.all([plusSession(), getCategories()]);
  const { data: menu } = await supabase
    .from('ma2_menus')
    .select('id, title, subtitle, is_plus, status, items:ma2_menu_items(id, category_id, day_index, position, dish:ma2_dishes(slug, name, image_url, category_id, status))')
    .eq('slug', slug)
    .maybeSingle();
  if (!menu) notFound();
  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  type It = { id: string; category_id: string; day_index: number | null; position: number; dish: { slug: string; name: string; image_url: string | null; category_id: string; status: string } | null };
  const items = ((menu.items as unknown as It[]) ?? []).filter((i) => i.dish && i.dish.status === 'publie').sort((a, b) => (a.day_index ?? 0) - (b.day_index ?? 0) || a.position - b.position);
  const locked = menu.is_plus && !plus;
  const days = [...new Set(items.map((i) => i.day_index ?? 0))];
  const today = todayIso(profile?.timezone || DEFAULT_TZ);
  return (
    <Page>
      <TopBar title="Menu" back="/menus" />
      <div className="px-5">
        <Notice ok={ok} err={err} />
        {menu.status !== 'publie' && <p className="mb-3 rounded-2xl bg-soleil-l px-4 py-3 text-[13px]">Aperçu équipe : ce menu n’est pas encore publié.</p>}
        <h1 className="text-[24px] font-extrabold leading-tight">{menu.title}</h1>
        {menu.subtitle && <p className="mt-1 text-[13px] text-gris">{menu.subtitle}</p>}
        {locked ? (
          <div className="mt-4">
            <PlusGate title="Ce menu fait partie de Plus" text="Débloque tous les menus et ajoute-les à ton planning en un clic." />
          </div>
        ) : (
          <>
            {user ? (
              <form action={applyMenu} className="mt-4">
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="day" value={today} />
                <button className="btn-violet w-full">Ajouter à mon planning à partir d’aujourd’hui</button>
              </form>
            ) : (
              <Link href="/connexion?suite=planning" className="btn-blanc mt-4 w-full">Se connecter pour l’ajouter au planning</Link>
            )}
            {days.map((d) => (
              <section key={d} className="mt-5">
                {d > 0 && <h2 className="titre-sec mb-2">{JOURS[d]}</h2>}
                <div className="carte">
                  {items.filter((i) => (i.day_index ?? 0) === d).map((i, k) => (
                    <Link key={i.id} href={`/plat/${i.dish!.slug}`} className={`flex items-center gap-3 px-4 py-3 ${k ? 'border-t border-[#f0ecfb]' : ''}`}>
                      <DishImage dish={i.dish!} className="h-12 w-12 flex-none" rounded="rounded-xl" />
                      <span className="min-w-0 flex-1">
                        <small className="block text-[11.5px] font-semibold text-violet-d">{catName[i.category_id]}</small>
                        <b className="block truncate text-sm">{i.dish!.name}</b>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </>
        )}
      </div>
    </Page>
  );
}
