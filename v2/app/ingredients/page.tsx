import type { Metadata } from 'next';
import { getDishes, getIngredients, getSession } from '@/lib/data';
import { Page, TopBar } from '@/components/ui';
import { IngredientMatcher } from '@/components/IngredientMatcher';

export const metadata: Metadata = { title: 'Mes ingrédients' };
export const dynamic = 'force-dynamic';

export default async function Ingredients() {
  const [ingredients, dishes, { user, supabase, allergies }] = await Promise.all([getIngredients(), getDishes(true), getSession()]);
  let saved: string[] = [];
  if (user) {
    const { data } = await supabase.from('ma2_available_ingredients').select('ingredient_id').eq('user_id', user.id);
    saved = (data ?? []).map((r) => r.ingredient_id as string);
  }
  const slim = dishes.map((d) => ({
    id: d.id,
    slug: d.slug,
    name: d.name,
    image_url: d.image_url,
    category_id: d.category_id,
    allergens: d.allergens,
    prep_minutes: d.prep_minutes,
    items: (d.dish_ingredients ?? []).map((x) => ({ id: x.ingredient_id, name: x.ingredient.name, optional: x.is_optional, substitutes: x.substitutes })),
  }));
  return (
    <Page>
      <TopBar title="Mes ingrédients" />
      <IngredientMatcher ingredients={ingredients.map((i) => ({ id: i.id, name: i.name, aliases: i.aliases }))} dishes={slim} initial={saved} userId={user?.id ?? null} allergies={allergies} />
    </Page>
  );
}
