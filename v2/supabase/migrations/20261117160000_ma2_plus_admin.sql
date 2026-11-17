-- Paiements Plus (Chariow) liés au compte, et outils de l'espace admin.

create table public.ma2_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('semaine', 'mois', 'trimestre', 'annee', 'offert')),
  days integer not null check (days between 1 and 400),
  amount integer not null default 0 check (amount >= 0),
  mode text not null check (mode in ('chariow', 'chariow-try', 'admin')),
  token text unique,
  status text not null default 'completed' check (status in ('completed', 'failed')),
  applied boolean not null default false,
  details jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index ma2_payments_user_idx on public.ma2_payments (user_id, created_at desc);
alter table public.ma2_payments enable row level security;
create policy ma2_payments_read on public.ma2_payments for select to authenticated
  using ((user_id = (select auth.uid()) and mode <> 'chariow-try') or public.ma2_has_role(array['admin']));
grant select on public.ma2_payments to authenticated;
grant select, insert, update, delete on public.ma2_payments to service_role;
revoke truncate, trigger, references on public.ma2_payments from anon, authenticated;

-- Applique un paiement une seule fois (appelé par la fonction serveur ma2-license)
create or replace function public.ma2_apply_payment(p_id uuid) returns json
language plpgsql security definer set search_path = '' as $$
declare v public.ma2_payments; v_until timestamptz;
begin
  select * into v from public.ma2_payments where id = p_id for update;
  if not found then return json_build_object('ok', false, 'error', 'not_found'); end if;
  if v.status <> 'completed' then return json_build_object('ok', false, 'error', 'not_completed'); end if;
  if v.applied then
    select plus_until into v_until from public.ma2_profiles where id = v.user_id;
    return json_build_object('ok', true, 'already', true, 'plan', v.plan, 'until', v_until);
  end if;
  insert into public.ma2_profiles (id) values (v.user_id) on conflict (id) do nothing;
  update public.ma2_profiles
     set plus_plan = v.plan,
         plus_until = greatest(coalesce(plus_until, now()), now()) + make_interval(days => v.days)
   where id = v.user_id
   returning plus_until into v_until;
  update public.ma2_payments set applied = true where id = p_id;
  return json_build_object('ok', true, 'plan', v.plan, 'until', v_until);
end $$;
revoke execute on function public.ma2_apply_payment(uuid) from public, anon, authenticated;
grant execute on function public.ma2_apply_payment(uuid) to service_role;

-- ---------- Espace admin ----------

-- Liste des comptes Mon Assiette (avec e-mail), réservée aux admins
create or replace function public.ma2_admin_users() returns table (
  id uuid, email text, display_name text, created_at timestamptz, last_sign_in_at timestamptz,
  plus_plan text, plus_until timestamptz, role text
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.ma2_has_role(array['admin']) then raise exception 'forbidden'; end if;
  return query
    select p.id, u.email::text, p.display_name, p.created_at, u.last_sign_in_at, p.plus_plan, p.plus_until, r.role
      from public.ma2_profiles p
      join auth.users u on u.id = p.id
      left join public.ma2_admin_roles r on r.user_id = p.id
     order by p.created_at desc
     limit 500;
end $$;
revoke execute on function public.ma2_admin_users() from public, anon;
grant execute on function public.ma2_admin_users() to authenticated;

-- Donne, change ou retire un rôle par e-mail. Si la personne ne s'est jamais connectée, on garde une invitation.
create or replace function public.ma2_admin_set_role(p_email text, p_role text) returns json
language plpgsql security definer set search_path = '' as $$
declare mail text := lower(trim(p_email)); uid uuid; me uuid := auth.uid();
begin
  if not public.ma2_has_role(array['admin']) then raise exception 'forbidden'; end if;
  if p_role is not null and p_role not in ('admin', 'editeur') then raise exception 'bad_role'; end if;
  if mail !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'bad_email'; end if;
  select u.id into uid from auth.users u join public.ma2_profiles p on p.id = u.id where lower(u.email) = mail;
  if uid = me and coalesce(p_role, '') <> 'admin' then raise exception 'self'; end if;
  if uid is null then
    if p_role is null then delete from public.ma2_admin_invites where email = mail;
    else insert into public.ma2_admin_invites (email, role, invited_by) values (mail, p_role, me)
         on conflict (email) do update set role = excluded.role, invited_by = excluded.invited_by;
    end if;
    return json_build_object('ok', true, 'pending', true);
  end if;
  if p_role is null then delete from public.ma2_admin_roles where user_id = uid;
  else insert into public.ma2_admin_roles (user_id, role, granted_by) values (uid, p_role, me)
       on conflict (user_id) do update set role = excluded.role, granted_by = excluded.granted_by;
  end if;
  return json_build_object('ok', true, 'pending', false);
end $$;
revoke execute on function public.ma2_admin_set_role(text, text) from public, anon;
grant execute on function public.ma2_admin_set_role(text, text) to authenticated;

-- Offre des jours de Plus à un compte (geste commercial, remboursement…), tracé dans ma2_payments
create or replace function public.ma2_admin_grant_plus(p_user uuid, p_days integer, p_note text) returns json
language plpgsql security definer set search_path = '' as $$
declare pid uuid;
begin
  if not public.ma2_has_role(array['admin']) then raise exception 'forbidden'; end if;
  if p_days is null or p_days < 1 or p_days > 400 then raise exception 'bad_days'; end if;
  if not exists (select 1 from public.ma2_profiles where id = p_user) then raise exception 'unknown_user'; end if;
  insert into public.ma2_payments (user_id, plan, days, amount, mode, status, details, created_by)
  values (p_user, 'offert', p_days, 0, 'admin', 'completed', jsonb_build_object('note', left(coalesce(p_note, ''), 200)), auth.uid())
  returning id into pid;
  return public.ma2_apply_payment(pid);
end $$;
revoke execute on function public.ma2_admin_grant_plus(uuid, integer, text) from public, anon;
grant execute on function public.ma2_admin_grant_plus(uuid, integer, text) to authenticated;

-- Chiffres du tableau de bord
create or replace function public.ma2_admin_stats() returns json
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.ma2_has_role(array['admin', 'editeur']) then raise exception 'forbidden'; end if;
  return json_build_object(
    'users', (select count(*) from public.ma2_profiles),
    'users_7d', (select count(*) from public.ma2_profiles where created_at > now() - interval '7 days'),
    'plus', (select count(*) from public.ma2_profiles where plus_until > now()),
    'dishes', (select count(*) from public.ma2_dishes where status = 'publie'),
    'drafts', (select count(*) from public.ma2_dishes where status in ('brouillon', 'a_verifier')),
    'feedback_new', (select count(*) from public.ma2_user_feedback where status = 'nouveau'),
    'revenue_30d', (select coalesce(sum(amount), 0) from public.ma2_payments where mode = 'chariow' and status = 'completed' and created_at > now() - interval '30 days'),
    'sales_30d', (select count(*) from public.ma2_payments where mode = 'chariow' and status = 'completed' and created_at > now() - interval '30 days')
  );
end $$;
revoke execute on function public.ma2_admin_stats() from public, anon;
grant execute on function public.ma2_admin_stats() to authenticated;
