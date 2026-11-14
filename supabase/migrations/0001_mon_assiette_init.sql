-- Mon Assiette : tables isolées par le préfixe ma_ (appliqué le 2026-11-14 sur le projet Supabase)
-- Identité sans compte : chaque appareil envoie un identifiant aléatoire (UUID) dans l'en-tête x-device-id.

create or replace function public.ma_device_id()
returns text language sql stable set search_path = '' as $$
  select nullif((coalesce(current_setting('request.headers', true), '{}')::json ->> 'x-device-id'), '');
$$;

create table if not exists public.ma_profiles (
  device_id text primary key check (char_length(device_id) between 32 and 64),
  name text not null default '' check (char_length(name) <= 60),
  goal text not null default 'energie' check (goal in ('energie','famille','grossesse','sante','poids')),
  household text not null default '4-6' check (household in ('1','2-3','4-6','7+')),
  kids boolean not null default false,
  budget integer not null default 1000 check (budget in (500,1000,2000)),
  lang text not null default 'Français' check (lang in ('Français','Mooré','Dioula','Fulfuldé')),
  notif jsonb not null default '{"meals":true,"water":true,"tips":false}'::jsonb,
  trial_plan text check (trial_plan in ('semaine','mois','famille')),
  trial_started_at timestamptz,
  trial_cancelled_at timestamptz,
  pay_method text check (pay_method in ('orange','moov','card')),
  pay_phone text check (pay_phone ~ '^[0-9]{8}$'),
  org_code text,
  improve_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ma_meal_logs (
  device_id text not null references public.ma_profiles(device_id) on delete cascade,
  day date not null,
  meal_key text not null check (char_length(meal_key) <= 20),
  taken_at timestamptz not null default now(),
  primary key (device_id, day, meal_key)
);

create table if not exists public.ma_water_logs (
  device_id text not null references public.ma_profiles(device_id) on delete cascade,
  day date not null,
  glasses integer not null default 0 check (glasses between 0 and 20),
  updated_at timestamptz not null default now(),
  primary key (device_id, day)
);

create table if not exists public.ma_improvements (
  id uuid primary key default gen_random_uuid(),
  device_id text not null references public.ma_profiles(device_id) on delete cascade,
  dish text not null check (char_length(dish) <= 40),
  score integer not null check (score between 0 and 100),
  tips jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ma_questions (
  id uuid primary key default gen_random_uuid(),
  device_id text not null references public.ma_profiles(device_id) on delete cascade,
  question text not null check (char_length(question) between 1 and 500),
  for_expert boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.ma_org_codes (
  code text primary key,
  org_name text not null,
  active boolean not null default true,
  max_uses integer,
  uses integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists ma_improvements_device_idx on public.ma_improvements(device_id, created_at desc);
create index if not exists ma_questions_device_idx on public.ma_questions(device_id, created_at desc);

alter table public.ma_profiles enable row level security;
alter table public.ma_meal_logs enable row level security;
alter table public.ma_water_logs enable row level security;
alter table public.ma_improvements enable row level security;
alter table public.ma_questions enable row level security;
alter table public.ma_org_codes enable row level security;

create policy ma_profiles_own on public.ma_profiles for all to anon, authenticated
  using (device_id = (select public.ma_device_id())) with check (device_id = (select public.ma_device_id()));
create policy ma_meal_logs_own on public.ma_meal_logs for all to anon, authenticated
  using (device_id = (select public.ma_device_id())) with check (device_id = (select public.ma_device_id()));
create policy ma_water_logs_own on public.ma_water_logs for all to anon, authenticated
  using (device_id = (select public.ma_device_id())) with check (device_id = (select public.ma_device_id()));
create policy ma_improvements_own on public.ma_improvements for all to anon, authenticated
  using (device_id = (select public.ma_device_id())) with check (device_id = (select public.ma_device_id()));
create policy ma_questions_own on public.ma_questions for all to anon, authenticated
  using (device_id = (select public.ma_device_id())) with check (device_id = (select public.ma_device_id()));

create or replace function public.ma_touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end; $$;
create trigger ma_profiles_touch before update on public.ma_profiles for each row execute function public.ma_touch_updated_at();

-- Essai Plus de 72 h : une seule fois par appareil (changement de formule autorisé pendant l'essai)
create or replace function public.ma_start_trial(p_plan text)
returns json language plpgsql security definer set search_path = '' as $$
declare v_dev text := public.ma_device_id(); v_p public.ma_profiles;
begin
  if v_dev is null then return json_build_object('ok', false, 'error', 'no_device'); end if;
  if p_plan not in ('semaine','mois','famille') then return json_build_object('ok', false, 'error', 'bad_plan'); end if;
  select * into v_p from public.ma_profiles where device_id = v_dev;
  if not found then return json_build_object('ok', false, 'error', 'no_profile'); end if;
  if v_p.trial_started_at is not null and (v_p.trial_cancelled_at is not null or v_p.trial_started_at < now() - interval '72 hours') then
    return json_build_object('ok', false, 'error', 'trial_used');
  end if;
  update public.ma_profiles set trial_plan = p_plan, trial_started_at = coalesce(v_p.trial_started_at, now())
   where device_id = v_dev returning * into v_p;
  return json_build_object('ok', true, 'plan', v_p.trial_plan, 'started_at', v_p.trial_started_at);
end; $$;

create or replace function public.ma_cancel_trial()
returns json language plpgsql security definer set search_path = '' as $$
declare v_dev text := public.ma_device_id();
begin
  update public.ma_profiles set trial_cancelled_at = now() where device_id = v_dev and trial_started_at is not null;
  return json_build_object('ok', true);
end; $$;

create or replace function public.ma_redeem_code(p_code text)
returns json language plpgsql security definer set search_path = '' as $$
declare v_dev text := public.ma_device_id(); v_c public.ma_org_codes;
begin
  if v_dev is null then return json_build_object('ok', false, 'error', 'no_device'); end if;
  select * into v_c from public.ma_org_codes where code = upper(trim(p_code)) and active;
  if not found then return json_build_object('ok', false, 'error', 'invalid'); end if;
  if v_c.max_uses is not null and v_c.uses >= v_c.max_uses then return json_build_object('ok', false, 'error', 'exhausted'); end if;
  update public.ma_org_codes set uses = uses + 1 where code = v_c.code;
  update public.ma_profiles set org_code = v_c.code where device_id = v_dev;
  return json_build_object('ok', true, 'org', v_c.org_name);
end; $$;

revoke all on function public.ma_start_trial(text) from public;
revoke all on function public.ma_cancel_trial() from public;
revoke all on function public.ma_redeem_code(text) from public;
grant execute on function public.ma_start_trial(text) to anon, authenticated;
grant execute on function public.ma_cancel_trial() to anon, authenticated;
grant execute on function public.ma_redeem_code(text) to anon, authenticated;
grant execute on function public.ma_device_id() to anon, authenticated;
grant select, insert, update, delete on public.ma_profiles, public.ma_meal_logs, public.ma_water_logs, public.ma_improvements, public.ma_questions to anon, authenticated;

insert into public.ma_org_codes (code, org_name, max_uses) values ('DEMO2026', 'Démo Mon Assiette', 100) on conflict (code) do nothing;

-- v3 : pays de résidence (menu local et fuseau horaire)
alter table public.ma_profiles add column if not exists country text;
alter table public.ma_profiles drop constraint if exists ma_profiles_country_check;
alter table public.ma_profiles add constraint ma_profiles_country_check check (country is null or country in ('bf','ci','sn','ml','bj','tg','ne','gn','autre0','autre1'));

-- v3.6 : paiements PayDunya et protection de l'abonnement
alter table public.ma_profiles add column if not exists plus_plan text;
alter table public.ma_profiles add column if not exists plus_until timestamptz;
-- (table ma_payments et fonction ma_apply_payment : voir l'historique des migrations Supabase « mon_assiette_paiements_paydunya »)
revoke insert, update on public.ma_profiles from anon, authenticated;
grant insert (device_id, name, goal, household, kids, budget, lang, notif, country, pay_method, pay_phone) on public.ma_profiles to anon, authenticated;
grant update (device_id, name, goal, household, kids, budget, lang, notif, country, pay_method, pay_phone, updated_at) on public.ma_profiles to anon, authenticated;
