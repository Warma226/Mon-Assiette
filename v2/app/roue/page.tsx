import type { Metadata } from 'next';
import { getCategories, getDishes, getSession, isPlus } from '@/lib/data';
import { currentCategory, DEFAULT_TZ, localNow } from '@/lib/time';
import { filterPool, isLate, LATE_TIP, loadNutriPool, rankFor, rankLate, type NDish } from '@/lib/nutrition';
import { weekStart } from '@/lib/week';
import { Page, TopBar } from '@/components/ui';
import { Wheel } from '@/components/Wheel';

export const metadata: Metadata = { title: 'La roue de Kalou' };
export const dynamic = 'force-dynamic';

// La roue ne tourne que parmi les plats qui complètent le mieux la journée :
// on choisit sans prise de tête, mais toujours parmi de bons choix.
export default async function Roue() {
  const [{ user, profile, allergies, prefs, supabase }, categories, dishes] = await Promise.all([getSession(), getCategories(), getDishes()]);
  const now = localNow(profile?.timezone || DEFAULT_TZ);
  const cat = currentCategory(categories, now.hour);
  const pool = filterPool(await loadNutriPool(supabase), allergies, prefs);
  let today: NDish[] = [];
  let have = new Set<string>();
  if (user) {
    const [{ data: plan }, { data: avail }] = await Promise.all([
      supabase.from('ma2_meal_plans').select('items:ma2_meal_plan_items(day, dish_id)').eq('user_id', user.id).eq('week_start', weekStart(now.isoDay)).maybeSingle(),
      supabase.from('ma2_available_ingredients').select('ingredient_id').eq('user_id', user.id),
    ]);
    const ids = ((plan?.items as { day: string; dish_id: string }[] | undefined) ?? []).filter((i) => i.day === now.isoDay).map((i) => i.dish_id);
    today = pool.filter((d) => ids.includes(d.id));
    have = new Set((avail ?? []).map((a) => a.ingredient_id as string));
  }
  const ranks = Object.fromEntries(categories.map((c) => [c.id, rankFor(pool, c.id, today, { have, seed: now.isoDay + (user?.id ?? '') }).slice(0, 8).map((d) => d.id)]));
  // Fin de soirée : un choix « léger » en plus, sélectionné par défaut
  const late = isLate(now.hour);
  if (late) ranks.tard = rankLate(pool, today, { seed: now.isoDay + (user?.id ?? '') }).slice(0, 8).map((d) => d.id);
  const keep = new Set(Object.values(ranks).flat());
  const cats = [...(late ? [{ id: 'tard', name: 'Fin de soirée' }] : []), ...categories.map((c) => ({ id: c.id, name: c.name }))];
  return (
    <Page>
      <TopBar title="La roue de Kalou" />
      <Wheel
        categories={cats}
        initialCategory={late ? 'tard' : cat?.id ?? 'dejeuner'}
        tip={late ? LATE_TIP : null}
        dishes={dishes.filter((d) => keep.has(d.id)).map((d) => ({ id: d.id, slug: d.slug, name: d.name, image_url: d.image_url, category_id: d.category_id, moments: d.moments }))}
        ranks={ranks}
        unlimited={isPlus(profile)}
        day={now.isoDay}
      />
    </Page>
  );
}
