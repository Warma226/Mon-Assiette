-- Mon Assiette Plus « assistant du quotidien » : menus, famille, courses, budget, rappels,
-- restaurants favoris, discussion avec Kalou, notifications.

-- Abonné Plus actif (ou membre de l'équipe)
create or replace function public.ma2_is_plus() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.ma2_profiles p where p.id = (select auth.uid()) and p.plus_until > now())
      or public.ma2_has_role(array['admin','editeur']);
$$;
revoke execute on function public.ma2_is_plus() from public;
grant execute on function public.ma2_is_plus() to anon, authenticated;

-- Rayon des ingrédients (pour regrouper la liste de courses)
alter table public.ma2_ingredients add column if not exists shelf text
  check (shelf in ('cereales', 'legumes', 'fruits', 'viandes', 'epicerie'));
update public.ma2_ingredients set shelf = case
  when name in ('Riz', 'Farine de maïs', 'Farine de petit mil', 'Farine de sorgho', 'Gari', 'Haricot (niébé)', 'Igname') then 'cereales'
  when name in ('Carotte', 'Chou', 'Feuilles d''oseille', 'Feuilles de baobab', 'Feuilles de haricot', 'Gombo', 'Oignon', 'Piment', 'Tomate', 'Gingembre') then 'legumes'
  when name in ('Mangue', 'Citron') then 'fruits'
  when name in ('Mouton', 'Poulet', 'Viande de bœuf', 'Poisson fumé') then 'viandes'
  else 'epicerie' end
where shelf is null;

-- ---------- Menus ----------
create table public.ma2_menus (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null check (char_length(title) between 2 and 80),
  subtitle text check (char_length(subtitle) <= 160),
  theme text not null default 'autre' check (theme in ('moderne', 'petit_budget', 'famille', 'ramadan', 'fete', 'rentree', 'local', 'autre')),
  is_plus boolean not null default true,
  status text not null default 'a_verifier' check (status in ('brouillon', 'a_verifier', 'publie', 'archive')),
  sort smallint not null default 100,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.ma2_menu_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.ma2_menus(id) on delete cascade,
  dish_id uuid not null references public.ma2_dishes(id) on delete cascade,
  category_id text not null references public.ma2_meal_categories(id),
  day_index smallint check (day_index between 1 and 7),
  position smallint not null default 0,
  note text check (char_length(note) <= 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ma2_menu_items_menu_idx on public.ma2_menu_items (menu_id, day_index, position);

-- ---------- Famille ----------
create table public.ma2_household_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  kind text not null default 'adulte' check (kind in ('adulte', 'enfant', 'bebe')),
  allergies text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ma2_household_user_idx on public.ma2_household_members (user_id);

-- ---------- Courses ----------
create table public.ma2_shopping_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  label text not null check (char_length(label) between 1 and 80),
  ingredient_id uuid references public.ma2_ingredients(id) on delete set null,
  shelf text,
  dishes text[] not null default '{}',
  checked boolean not null default false,
  source text not null default 'manuel' check (source in ('auto', 'manuel')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ma2_shopping_user_idx on public.ma2_shopping_items (user_id, week_start);

-- ---------- Budget (dépenses notées par l'utilisateur) ----------
create table public.ma2_budget_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  amount integer not null check (amount between 1 and 10000000),
  label text check (char_length(label) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ma2_budget_user_idx on public.ma2_budget_entries (user_id, day);

-- ---------- Rappels et notifications ----------
create table public.ma2_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('repas', 'eau', 'decongeler', 'marche', 'autre')),
  label text not null check (char_length(label) between 1 and 80),
  at_time time not null,
  days smallint[] not null default '{1,2,3,4,5,6,7}',
  enabled boolean not null default true,
  last_sent_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ma2_reminders_user_idx on public.ma2_reminders (user_id);

create table public.ma2_push_subscriptions (
  endpoint text primary key check (char_length(endpoint) <= 1000),
  user_id uuid not null references auth.users(id) on delete cascade,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create index ma2_push_user_idx on public.ma2_push_subscriptions (user_id);

-- ---------- Restaurants favoris (identifiant Google seulement + libellé saisi) ----------
create table public.ma2_restaurant_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id text not null check (char_length(place_id) <= 300),
  name text not null check (char_length(name) <= 120),
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

-- ---------- Discussion avec Kalou ----------
create table public.ma2_kalou_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) <= 8000),
  created_at timestamptz not null default now()
);
create index ma2_kalou_user_idx on public.ma2_kalou_messages (user_id, created_at desc);

-- Compteur d'usage des services payants (Google, IA) : écrit seulement par les fonctions serveur
create table public.ma2_api_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('places', 'kalou')),
  day date not null,
  count integer not null default 0,
  primary key (user_id, kind, day)
);

-- ---------- Déclencheurs updated_at ----------
do $$
declare t text;
begin
  foreach t in array array['ma2_menus','ma2_menu_items','ma2_household_members','ma2_shopping_items','ma2_budget_entries','ma2_reminders']
  loop
    execute format('create trigger %I before update on public.%I for each row execute function public.ma2_touch()', t || '_touch', t);
  end loop;
end $$;

-- ---------- Sécurité ----------
alter table public.ma2_menus enable row level security;
alter table public.ma2_menu_items enable row level security;
alter table public.ma2_household_members enable row level security;
alter table public.ma2_shopping_items enable row level security;
alter table public.ma2_budget_entries enable row level security;
alter table public.ma2_reminders enable row level security;
alter table public.ma2_push_subscriptions enable row level security;
alter table public.ma2_restaurant_favorites enable row level security;
alter table public.ma2_kalou_messages enable row level security;
alter table public.ma2_api_usage enable row level security;

-- Menus : les menus publiés sont visibles de tous (titre) ; le contenu d'un menu Plus est réservé à Plus
create policy ma2_menus_read on public.ma2_menus for select to anon, authenticated
  using (status = 'publie' or public.ma2_has_role(array['admin','editeur']));
create policy ma2_menus_edit on public.ma2_menus for all to authenticated
  using (public.ma2_has_role(array['admin','editeur'])) with check (public.ma2_has_role(array['admin','editeur']));
create policy ma2_menu_items_read on public.ma2_menu_items for select to anon, authenticated
  using (exists (select 1 from public.ma2_menus m where m.id = menu_id and
    ((m.status = 'publie' and (not m.is_plus or public.ma2_is_plus())) or public.ma2_has_role(array['admin','editeur']))));
create policy ma2_menu_items_edit on public.ma2_menu_items for all to authenticated
  using (public.ma2_has_role(array['admin','editeur'])) with check (public.ma2_has_role(array['admin','editeur']));

-- Données personnelles Plus : lecture par le propriétaire ; écriture seulement si Plus actif
do $$
declare t text;
begin
  foreach t in array array['ma2_household_members','ma2_shopping_items','ma2_budget_entries','ma2_reminders','ma2_restaurant_favorites']
  loop
    execute format('create policy %I on public.%I for select to authenticated using (user_id = (select auth.uid()))', t || '_own_read', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (user_id = (select auth.uid()) and public.ma2_is_plus())', t || '_own_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and public.ma2_is_plus())', t || '_own_update', t);
    execute format('create policy %I on public.%I for delete to authenticated using (user_id = (select auth.uid()))', t || '_own_delete', t);
  end loop;
end $$;

-- Abonnements aux notifications : chacun les siens
create policy ma2_push_own on public.ma2_push_subscriptions for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
-- Discussion : lecture et effacement de son historique ; écriture par la fonction serveur
create policy ma2_kalou_read on public.ma2_kalou_messages for select to authenticated using (user_id = (select auth.uid()));
create policy ma2_kalou_delete on public.ma2_kalou_messages for delete to authenticated using (user_id = (select auth.uid()));
-- Usage : lecture du sien
create policy ma2_usage_read on public.ma2_api_usage for select to authenticated using (user_id = (select auth.uid()));

-- Droits
grant select on public.ma2_menus, public.ma2_menu_items to anon, authenticated;
grant insert, update, delete on public.ma2_menus, public.ma2_menu_items to authenticated;
grant select, insert, update, delete on public.ma2_household_members, public.ma2_shopping_items, public.ma2_budget_entries,
  public.ma2_reminders, public.ma2_push_subscriptions, public.ma2_restaurant_favorites to authenticated;
grant select, delete on public.ma2_kalou_messages to authenticated;
grant select on public.ma2_api_usage to authenticated;
grant select, insert, update, delete on public.ma2_menus, public.ma2_menu_items, public.ma2_household_members, public.ma2_shopping_items,
  public.ma2_budget_entries, public.ma2_reminders, public.ma2_push_subscriptions, public.ma2_restaurant_favorites,
  public.ma2_kalou_messages, public.ma2_api_usage to service_role;
do $$
declare t text;
begin
  foreach t in array array['ma2_menus','ma2_menu_items','ma2_household_members','ma2_shopping_items','ma2_budget_entries','ma2_reminders','ma2_push_subscriptions','ma2_restaurant_favorites','ma2_kalou_messages','ma2_api_usage']
  loop
    execute format('revoke truncate, trigger, references on public.%I from anon, authenticated', t);
  end loop;
end $$;

-- Compteur d'usage atomique (appelé par les fonctions serveur) : renvoie le total du jour après ajout
create or replace function public.ma2_bump_usage(p_user uuid, p_kind text, p_limit integer) returns integer
language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  insert into public.ma2_api_usage (user_id, kind, day, count) values (p_user, p_kind, (now() at time zone 'utc')::date, 1)
  on conflict (user_id, kind, day) do update set count = public.ma2_api_usage.count + 1
  where public.ma2_api_usage.count < p_limit
  returning count into n;
  return coalesce(n, -1);
end $$;
revoke execute on function public.ma2_bump_usage(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.ma2_bump_usage(uuid, text, integer) to service_role;
