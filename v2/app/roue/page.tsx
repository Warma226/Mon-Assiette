import type { Metadata } from 'next';
import { getCategories, getDishes, getSession, isPlus } from '@/lib/data';
import { currentCategory, DEFAULT_TZ, localNow } from '@/lib/time';
import { Page, TopBar } from '@/components/ui';
import { Wheel } from '@/components/Wheel';

export const metadata: Metadata = { title: 'La roue de Kalou' };
export const dynamic = 'force-dynamic';

export default async function Roue() {
  const [{ profile, allergies }, categories, dishes] = await Promise.all([getSession(), getCategories(), getDishes()]);
  const now = localNow(profile?.timezone || DEFAULT_TZ);
  const cat = currentCategory(categories, now.hour);
  return (
    <Page>
      <TopBar title="La roue de Kalou" />
      <Wheel
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        initialCategory={cat?.id ?? 'dejeuner'}
        dishes={dishes.filter((d) => !d.allergens.some((a) => allergies.includes(a))).map((d) => ({ id: d.id, slug: d.slug, name: d.name, image_url: d.image_url, category_id: d.category_id, moments: d.moments }))}
        unlimited={isPlus(profile)}
        day={now.isoDay}
      />
    </Page>
  );
}
