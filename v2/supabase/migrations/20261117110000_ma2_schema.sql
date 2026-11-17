-- Mon Assiette v2 : schéma de base (cahier des charges §11)
-- Toutes les tables sont préfixées ma2_ car le projet Supabase est partagé.

create extension if not exists pgcrypto;

-- ---------- Fonctions utilitaires ----------
create or replace function public.ma2_touch() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

-- ---------- Référentiels ----------
create table public.ma2_countries (
  id text primary key check (id ~ '^[a-z]{2}$'),
  name text not null,
  timezone text not null,
  currency text not null default 'XOF',
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ma2_regions (
  id uuid primary key default gen_random_uuid(),
  country_id text not null references public.ma2_countries(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (country_id, name)
);

create table public.ma2_meal_categories (
  id text primary key,
  name text not null,
  sort smallint not null,
  start_hour smallint not null check (start_hour between 0 and 23),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ma2_dietary_preferences (
  id text primary key,
  name text not null,
  kind text not null check (kind in ('preference', 'restriction', 'allergie')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Catalogue ----------
create table public.ma2_ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  aliases text[] not null default '{}',
  allergen text references public.ma2_dietary_preferences(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ma2_dishes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  alt_names text[] not null default '{}',
  country_id text not null references public.ma2_countries(id),
  region_id uuid references public.ma2_regions(id) on delete set null,
  community text,
  category_id text not null references public.ma2_meal_categories(id),
  moments text[] not null default '{}',
  description text not null default '',
  image_url text,
  image_credit text,
  image_license text,
  image_source text,
  servings smallint check (servings between 1 and 50),
  prep_minutes smallint check (prep_minutes between 1 and 1440),
  difficulty text check (difficulty in ('facile', 'moyen', 'difficile')),
  allergens text[] not null default '{}',
  tags text[] not null default '{}',
  available_countries text[] not null default '{}',
  status text not null default 'brouillon' check (status in ('brouillon', 'a_verifier', 'publie', 'archive')),
  verified_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ma2_dishes_status_idx on public.ma2_dishes (status);
create index ma2_dishes_country_idx on public.ma2_dishes (country_id);
create index ma2_dishes_category_idx on public.ma2_dishes (category_id);
create index ma2_dishes_moments_idx on public.ma2_dishes using gin (moments);

create table public.ma2_dish_ingredients (
  dish_id uuid not null references public.ma2_dishes(id) on delete cascade,
  ingredient_id uuid not null references public.ma2_ingredients(id) on delete restrict,
  quantity numeric check (quantity > 0),
  unit text,
  is_optional boolean not null default false,
  substitutes text,
  position smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (dish_id, ingredient_id)
);
create index ma2_dish_ingredients_ing_idx on public.ma2_dish_ingredients (ingredient_id);

create table public.ma2_recipes (
  id uuid primary key default gen_random_uuid(),
  dish_id uuid not null unique references public.ma2_dishes(id) on delete cascade,
  source text,
  notes text,
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ma2_recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.ma2_recipes(id) on delete cascade,
  position smallint not null,
  body text not null,
  minutes smallint check (minutes between 0 and 1440),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (recipe_id, position)
);

create table public.ma2_nutrition_facts (
  dish_id uuid primary key references public.ma2_dishes(id) on delete cascade,
  per_portion_g numeric,
  energy_kcal numeric, protein_g numeric, carbs_g numeric, fat_g numeric, fiber_g numeric,
  food_groups text[] not null default '{}',
  source text not null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ma2_food_prices (
  id uuid primary key default gen_random_uuid(),
  dish_id uuid references public.ma2_dishes(id) on delete cascade,
  ingredient_id uuid references public.ma2_ingredients(id) on delete cascade,
  country_id text not null references public.ma2_countries(id),
  region_id uuid references public.ma2_regions(id) on delete set null,
  price_min integer not null check (price_min >= 0),
  price_max integer not null check (price_max >= price_min),
  unit text not null,
  source text not null,
  observed_at date not null,
  status text not null default 'a_verifier' check (status in ('a_verifier', 'publie', 'archive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((dish_id is null) <> (ingredient_id is null))
);
create index ma2_food_prices_dish_idx on public.ma2_food_prices (dish_id);

-- ---------- Utilisateurs ----------
create table public.ma2_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 60),
  country_id text references public.ma2_countries(id),
  city text check (char_length(city) <= 80),
  language text not null default 'fr',
  timezone text,
  budget_amount integer check (budget_amount >= 0),
  budget_period text check (budget_period in ('jour', 'semaine')),
  household_size smallint check (household_size between 1 and 30),
  plus_plan text,
  plus_until timestamptz,
  trial_started_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ma2_user_preferences (
  user_id uuid not null references auth.users(id) on delete cascade,
  preference_id text not null references public.ma2_dietary_preferences(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, preference_id)
);

create table public.ma2_user_allergies (
  user_id uuid not null references auth.users(id) on delete cascade,
  allergen_id text not null references public.ma2_dietary_preferences(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, allergen_id)
);

create table public.ma2_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  dish_id uuid not null references public.ma2_dishes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, dish_id)
);
create index ma2_favorites_dish_idx on public.ma2_favorites (dish_id);

create table public.ma2_meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create table public.ma2_meal_plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.ma2_meal_plans(id) on delete cascade,
  day date not null,
  category_id text not null references public.ma2_meal_categories(id),
  dish_id uuid references public.ma2_dishes(id) on delete set null,
  note text check (char_length(note) <= 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ma2_meal_plan_items_plan_idx on public.ma2_meal_plan_items (plan_id, day);

create table public.ma2_available_ingredients (
  user_id uuid not null references auth.users(id) on delete cascade,
  ingredient_id uuid not null references public.ma2_ingredients(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, ingredient_id)
);

create table public.ma2_user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  dish_id uuid references public.ma2_dishes(id) on delete set null,
  kind text not null check (kind in ('erreur', 'suggestion', 'avis', 'autre')),
  message text not null check (char_length(message) between 3 and 2000),
  status text not null default 'nouveau' check (status in ('nouveau', 'lu', 'traite')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ma2_admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'editeur')),
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Déclencheurs updated_at ----------
do $$
declare t text;
begin
  foreach t in array array['ma2_countries','ma2_regions','ma2_meal_categories','ma2_dietary_preferences','ma2_ingredients','ma2_dishes','ma2_dish_ingredients','ma2_recipes','ma2_recipe_steps','ma2_nutrition_facts','ma2_food_prices','ma2_profiles','ma2_meal_plans','ma2_meal_plan_items','ma2_user_feedback','ma2_admin_roles']
  loop
    execute format('create trigger %I before update on public.%I for each row execute function public.ma2_touch()', t || '_touch', t);
  end loop;
end $$;

-- ---------- Rôles ----------
create or replace function public.ma2_has_role(roles text[]) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.ma2_admin_roles r where r.user_id = (select auth.uid()) and r.role = any(roles));
$$;
revoke execute on function public.ma2_has_role(text[]) from public;
grant execute on function public.ma2_has_role(text[]) to anon, authenticated;

-- Profil créé à la première connexion (pas de déclencheur sur auth.users : le projet est partagé)
create or replace function public.ma2_ensure_profile() returns public.ma2_profiles
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); meta jsonb; p public.ma2_profiles;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  select raw_user_meta_data into meta from auth.users where id = uid;
  insert into public.ma2_profiles (id, display_name)
  values (uid, nullif(left(coalesce(meta->>'full_name', meta->>'name', ''), 60), ''))
  on conflict (id) do nothing;
  select * into p from public.ma2_profiles where id = uid;
  return p;
end $$;
revoke execute on function public.ma2_ensure_profile() from public, anon;
grant execute on function public.ma2_ensure_profile() to authenticated;

-- ---------- Sécurité (RLS) ----------
do $$
declare t text;
begin
  foreach t in array array['ma2_countries','ma2_regions','ma2_meal_categories','ma2_dietary_preferences','ma2_ingredients','ma2_dishes','ma2_dish_ingredients','ma2_recipes','ma2_recipe_steps','ma2_nutrition_facts','ma2_food_prices','ma2_profiles','ma2_user_preferences','ma2_user_allergies','ma2_favorites','ma2_meal_plans','ma2_meal_plan_items','ma2_available_ingredients','ma2_user_feedback','ma2_admin_roles']
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Référentiels : lecture publique, écriture équipe éditoriale
do $$
declare t text;
begin
  foreach t in array array['ma2_countries','ma2_regions','ma2_meal_categories','ma2_dietary_preferences','ma2_ingredients']
  loop
    execute format('create policy %I on public.%I for select to anon, authenticated using (true)', t || '_read', t);
    execute format('create policy %I on public.%I for all to authenticated using (public.ma2_has_role(array[''admin'',''editeur''])) with check (public.ma2_has_role(array[''admin'',''editeur'']))', t || '_edit', t);
  end loop;
end $$;

-- Plats : publics seulement s'ils sont publiés
create policy ma2_dishes_read on public.ma2_dishes for select to anon, authenticated
  using (status = 'publie' or public.ma2_has_role(array['admin','editeur']));
create policy ma2_dishes_edit on public.ma2_dishes for all to authenticated
  using (public.ma2_has_role(array['admin','editeur'])) with check (public.ma2_has_role(array['admin','editeur']));

-- Contenus liés à un plat : visibles si le plat l'est
create policy ma2_dish_ingredients_read on public.ma2_dish_ingredients for select to anon, authenticated
  using (exists (select 1 from public.ma2_dishes d where d.id = dish_id and (d.status = 'publie' or public.ma2_has_role(array['admin','editeur']))));
create policy ma2_recipes_read on public.ma2_recipes for select to anon, authenticated
  using (exists (select 1 from public.ma2_dishes d where d.id = dish_id and (d.status = 'publie' or public.ma2_has_role(array['admin','editeur']))));
create policy ma2_recipe_steps_read on public.ma2_recipe_steps for select to anon, authenticated
  using (exists (select 1 from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where r.id = recipe_id and (d.status = 'publie' or public.ma2_has_role(array['admin','editeur']))));
-- Nutrition et prix : seulement les valeurs vérifiées / publiées (jamais de valeur non sourcée)
create policy ma2_nutrition_read on public.ma2_nutrition_facts for select to anon, authenticated
  using ((verified_at is not null and exists (select 1 from public.ma2_dishes d where d.id = dish_id and d.status = 'publie')) or public.ma2_has_role(array['admin','editeur']));
create policy ma2_prices_read on public.ma2_food_prices for select to anon, authenticated
  using (status = 'publie' or public.ma2_has_role(array['admin','editeur']));
do $$
declare t text;
begin
  foreach t in array array['ma2_dish_ingredients','ma2_recipes','ma2_recipe_steps','ma2_nutrition_facts','ma2_food_prices']
  loop
    execute format('create policy %I on public.%I for all to authenticated using (public.ma2_has_role(array[''admin'',''editeur''])) with check (public.ma2_has_role(array[''admin'',''editeur'']))', t || '_edit', t);
  end loop;
end $$;

-- Profil : chacun le sien ; les champs d'abonnement ne sont pas modifiables par l'utilisateur
create policy ma2_profiles_own_read on public.ma2_profiles for select to authenticated
  using (id = (select auth.uid()) or public.ma2_has_role(array['admin']));
create policy ma2_profiles_own_update on public.ma2_profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke insert, update, delete on public.ma2_profiles from anon, authenticated;
grant update (display_name, country_id, city, language, timezone, budget_amount, budget_period, household_size) on public.ma2_profiles to authenticated;

-- Données personnelles : chacun les siennes
do $$
declare t text;
begin
  foreach t in array array['ma2_user_preferences','ma2_user_allergies','ma2_favorites','ma2_meal_plans','ma2_available_ingredients']
  loop
    execute format('create policy %I on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t || '_own', t);
  end loop;
end $$;
create policy ma2_meal_plan_items_own on public.ma2_meal_plan_items for all to authenticated
  using (exists (select 1 from public.ma2_meal_plans p where p.id = plan_id and p.user_id = (select auth.uid())))
  with check (exists (select 1 from public.ma2_meal_plans p where p.id = plan_id and p.user_id = (select auth.uid())));

-- Retours : tout le monde peut écrire, seule l'administration lit
create policy ma2_feedback_insert on public.ma2_user_feedback for insert to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));
create policy ma2_feedback_admin on public.ma2_user_feedback for select to authenticated
  using (public.ma2_has_role(array['admin','editeur']));
create policy ma2_feedback_admin_update on public.ma2_user_feedback for update to authenticated
  using (public.ma2_has_role(array['admin','editeur'])) with check (public.ma2_has_role(array['admin','editeur']));

-- Rôles : on voit le sien ; seul un admin gère
create policy ma2_roles_read on public.ma2_admin_roles for select to authenticated
  using (user_id = (select auth.uid()) or public.ma2_has_role(array['admin']));
create policy ma2_roles_admin on public.ma2_admin_roles for all to authenticated
  using (public.ma2_has_role(array['admin'])) with check (public.ma2_has_role(array['admin']));

-- Droits de base (uniquement sur les tables ma2_)
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' and tablename like 'ma2\_%'
  loop
    execute format('revoke truncate, trigger, references on public.%I from anon, authenticated', t);
  end loop;
end $$;
