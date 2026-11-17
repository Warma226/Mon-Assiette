import { createClient } from '@/lib/supabase/server';

export type Category = { id: string; name: string; sort: number; start_hour: number };
export type Ingredient = { id: string; name: string; aliases: string[]; allergen: string | null };
export type DishIngredient = { ingredient_id: string; quantity: number | null; unit: string | null; is_optional: boolean; substitutes: string | null; position: number; ingredient: Ingredient };
export type Dish = {
  id: string;
  slug: string;
  name: string;
  alt_names: string[];
  country_id: string;
  community: string | null;
  category_id: string;
  moments: string[];
  description: string;
  image_url: string | null;
  image_credit: string | null;
  image_license: string | null;
  image_source: string | null;
  servings: number | null;
  prep_minutes: number | null;
  difficulty: string | null;
  allergens: string[];
  tags: string[];
  dish_ingredients?: DishIngredient[];
};
export type Preference = { id: string; name: string; kind: 'preference' | 'restriction' | 'allergie' };
export type Profile = {
  id: string;
  display_name: string | null;
  country_id: string | null;
  city: string | null;
  timezone: string | null;
  budget_amount: number | null;
  budget_period: 'jour' | 'semaine' | null;
  household_size: number | null;
  plus_plan: string | null;
  plus_until: string | null;
};

const DISH_FIELDS =
  'id, slug, name, alt_names, country_id, community, category_id, moments, description, image_url, image_credit, image_license, image_source, servings, prep_minutes, difficulty, allergens, tags';

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('ma2_meal_categories').select('id, name, sort, start_hour').order('sort');
  return data ?? [];
}

export async function getDishes(withIngredients = false): Promise<Dish[]> {
  const supabase = await createClient();
  const fields = withIngredients
    ? `${DISH_FIELDS}, dish_ingredients:ma2_dish_ingredients(ingredient_id, quantity, unit, is_optional, substitutes, position, ingredient:ma2_ingredients(id, name, aliases, allergen))`
    : DISH_FIELDS;
  const { data } = await supabase.from('ma2_dishes').select(fields).eq('status', 'publie').order('name');
  return (data as unknown as Dish[]) ?? [];
}

export async function getDish(slug: string) {
  const supabase = await createClient();
  const { data: dish } = await supabase
    .from('ma2_dishes')
    .select(
      `${DISH_FIELDS}, dish_ingredients:ma2_dish_ingredients(ingredient_id, quantity, unit, is_optional, substitutes, position, ingredient:ma2_ingredients(id, name, aliases, allergen))`,
    )
    .eq('slug', slug)
    .maybeSingle();
  if (!dish) return null;
  const d = dish as unknown as Dish;
  const [{ data: recipe }, { data: nutrition }, { data: prices }] = await Promise.all([
    supabase.from('ma2_recipes').select('id, source, verified_at, steps:ma2_recipe_steps(position, body, minutes)').eq('dish_id', d.id).maybeSingle(),
    supabase.from('ma2_nutrition_facts').select('*').eq('dish_id', d.id).maybeSingle(),
    supabase.from('ma2_food_prices').select('price_min, price_max, unit, source, observed_at').eq('dish_id', d.id).eq('status', 'publie').order('observed_at', { ascending: false }).limit(1),
  ]);
  d.dish_ingredients?.sort((a, b) => a.position - b.position);
  const steps = ((recipe?.steps as { position: number; body: string; minutes: number | null }[] | undefined) ?? []).sort((a, b) => a.position - b.position);
  return { dish: d, recipe: recipe && recipe.verified_at ? { ...recipe, steps } : null, nutrition, price: prices?.[0] ?? null };
}

export async function getIngredients(): Promise<Ingredient[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('ma2_ingredients').select('id, name, aliases, allergen').order('name');
  return data ?? [];
}

export async function getPreferences(): Promise<Preference[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('ma2_dietary_preferences').select('id, name, kind').order('name');
  return (data as Preference[]) ?? [];
}

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null as Profile | null, allergies: [] as string[], prefs: [] as string[] };
  const { data: profile } = await supabase.rpc('ma2_ensure_profile');
  const [{ data: al }, { data: pr }] = await Promise.all([
    supabase.from('ma2_user_allergies').select('allergen_id').eq('user_id', user.id),
    supabase.from('ma2_user_preferences').select('preference_id').eq('user_id', user.id),
  ]);
  return {
    supabase,
    user,
    profile: profile as Profile | null,
    allergies: (al ?? []).map((r) => r.allergen_id as string),
    prefs: (pr ?? []).map((r) => r.preference_id as string),
  };
}

export function isPlus(profile: Profile | null) {
  return !!(profile?.plus_until && new Date(profile.plus_until).getTime() > Date.now());
}
