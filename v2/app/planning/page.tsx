import Link from 'next/link';
import type { Metadata } from 'next';
import { getCategories, getDishes, getSession } from '@/lib/data';
import { DEFAULT_TZ } from '@/lib/time';
import { addDays, dayLabel, todayIso, weekStart } from '@/lib/week';
import { Empty, Page, TopBar } from '@/components/ui';
import { PlanDay } from '@/components/PlanDay';

export const metadata: Metadata = { title: 'Mon planning' };
export const dynamic = 'force-dynamic';

export default async function Planning({ searchParams }: { searchParams: Promise<{ jour?: string }> }) {
  const { jour } = await searchParams;
  const { user, profile, supabase } = await getSession();
  if (!user)
    return (
      <Page>
        <TopBar title="Mon planning" />
        <div className="px-5">
          <Empty title="Organise tes repas de la semaine" text="Connecte-toi pour enregistrer ton planning et le retrouver sur tous tes appareils." action={<Link href="/connexion?suite=planning" className="btn-violet h-11 text-sm">Se connecter</Link>} />
        </div>
      </Page>
    );
  const today = todayIso(profile?.timezone || DEFAULT_TZ);
  const day = jour && /^\d{4}-\d{2}-\d{2}$/.test(jour) ? jour : today;
  const ws = weekStart(day);
  const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
  const [categories, dishes, { data: plan }] = await Promise.all([
    getCategories(),
    getDishes(),
    supabase.from('ma2_meal_plans').select('id, items:ma2_meal_plan_items(id, day, category_id, note, dish:ma2_dishes(id, slug, name, image_url, category_id))').eq('user_id', user.id).eq('week_start', ws).maybeSingle(),
  ]);
  type Item = { id: string; day: string; category_id: string; note: string | null; dish: { id: string; slug: string; name: string; image_url: string | null; category_id: string } | null };
  const items = ((plan?.items as unknown as Item[]) ?? []).filter((i) => i.day === day);
  const counts = Object.fromEntries(days.map((d) => [d, ((plan?.items as unknown as Item[]) ?? []).filter((i) => i.day === d).length]));

  return (
    <Page>
      <TopBar title="Mon planning" />
      <div className="px-5">
        <div className="mb-2 flex items-center justify-between">
          <Link href={`/planning?jour=${addDays(ws, -7)}`} className="pastille bg-white">‹ Semaine précédente</Link>
          <Link href={`/planning?jour=${addDays(ws, 7)}`} className="pastille bg-white">Semaine suivante ›</Link>
        </div>
        <div className="carte grid grid-cols-7 gap-1 p-2">
          {days.map((d) => (
            <Link key={d} href={`/planning?jour=${d}`} aria-current={d === day ? 'date' : undefined} className={`flex h-[62px] flex-col items-center justify-center gap-0.5 rounded-2xl ${d === day ? 'bg-violet text-white' : ''}`}>
              <small className="text-[11px] capitalize opacity-80">{d === today ? 'Auj.' : dayLabel(d).replace('.', '')}</small>
              <b className="text-base">{Number(d.slice(8))}</b>
              <span className={`h-1 w-1 rounded-full ${counts[d] ? (d === day ? 'bg-white' : 'bg-violet') : 'bg-transparent'}`} />
            </Link>
          ))}
        </div>
        <div className="mb-1 mt-4">
          <b className="block text-base capitalize">{dayLabel(day, 'long')}</b>
          {profile?.budget_amount ? (
            <span className="pastille mt-1.5 bg-emeraude-l text-[#035C43]">
              Budget indicatif : {profile.budget_amount} F par {profile.budget_period === 'semaine' ? 'semaine' : 'jour'}
            </span>
          ) : null}
        </div>
        <PlanDay day={day} categories={categories} items={items} dishes={dishes.map((d) => ({ id: d.id, name: d.name, moments: d.moments, category_id: d.category_id }))} />
      </div>
    </Page>
  );
}
