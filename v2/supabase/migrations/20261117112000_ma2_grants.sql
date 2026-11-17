-- Droits explicites (le projet ne donne pas de droits par défaut aux nouvelles tables).
-- Les politiques RLS restent la vraie barrière : ces droits ne font qu'ouvrir la porte qu'elles filtrent.

-- Catalogue et référentiels : lecture pour tous, écriture pour les connectés (RLS : éditeurs seulement)
grant select on public.ma2_countries, public.ma2_regions, public.ma2_meal_categories, public.ma2_dietary_preferences,
  public.ma2_ingredients, public.ma2_dishes, public.ma2_dish_ingredients, public.ma2_recipes, public.ma2_recipe_steps,
  public.ma2_nutrition_facts, public.ma2_food_prices to anon, authenticated;
grant insert, update, delete on public.ma2_countries, public.ma2_regions, public.ma2_meal_categories, public.ma2_dietary_preferences,
  public.ma2_ingredients, public.ma2_dishes, public.ma2_dish_ingredients, public.ma2_recipes, public.ma2_recipe_steps,
  public.ma2_nutrition_facts, public.ma2_food_prices to authenticated;

-- Données personnelles : connectés seulement (RLS : chacun les siennes)
grant select, insert, update, delete on public.ma2_user_preferences, public.ma2_user_allergies, public.ma2_favorites,
  public.ma2_meal_plans, public.ma2_meal_plan_items, public.ma2_available_ingredients to authenticated;

-- Profil : lecture, et modification des seuls champs autorisés (pas l'abonnement)
grant select on public.ma2_profiles to authenticated;
grant update (display_name, country_id, city, language, timezone, budget_amount, budget_period, household_size) on public.ma2_profiles to authenticated;

-- Retours : tout le monde peut en envoyer ; lecture et suivi par l'équipe (RLS)
grant insert on public.ma2_user_feedback to anon, authenticated;
grant select, update on public.ma2_user_feedback to authenticated;

-- Rôles (RLS : lecture du sien, gestion par un admin)
grant select, insert, update, delete on public.ma2_admin_roles to authenticated;

-- Fonctions serveur (Edge Functions) : accès complet
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' and tablename like 'ma2\_%'
  loop
    execute format('grant select, insert, update, delete on public.%I to service_role', t);
  end loop;
end $$;
