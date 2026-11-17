-- Invitations de l'équipe : le rôle est donné automatiquement à la première connexion de l'adresse.
create table public.ma2_admin_invites (
  email text primary key check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  role text not null check (role in ('admin', 'editeur')),
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.ma2_admin_invites enable row level security;
create policy ma2_invites_admin on public.ma2_admin_invites for all to authenticated
  using (public.ma2_has_role(array['admin'])) with check (public.ma2_has_role(array['admin']));
grant select, insert, update, delete on public.ma2_admin_invites to authenticated;
grant select, insert, update, delete on public.ma2_admin_invites to service_role;
revoke truncate, trigger, references on public.ma2_admin_invites from anon, authenticated;

create or replace function public.ma2_ensure_profile() returns public.ma2_profiles
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); meta jsonb; mail text; p public.ma2_profiles;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  select raw_user_meta_data, lower(email) into meta, mail from auth.users where id = uid;
  insert into public.ma2_profiles (id, display_name)
  values (uid, nullif(left(coalesce(meta->>'full_name', meta->>'name', ''), 60), ''))
  on conflict (id) do nothing;
  -- Invitation en attente : on donne le rôle une seule fois, puis on la retire
  insert into public.ma2_admin_roles (user_id, role, granted_by)
  select uid, i.role, i.invited_by from public.ma2_admin_invites i where i.email = mail
  on conflict (user_id) do nothing;
  delete from public.ma2_admin_invites where email = mail;
  select * into p from public.ma2_profiles where id = uid;
  return p;
end $$;
revoke execute on function public.ma2_ensure_profile() from public, anon;
grant execute on function public.ma2_ensure_profile() to authenticated;

insert into public.ma2_admin_invites (email, role) values ('warmachinertech@gmail.com', 'admin')
on conflict (email) do update set role = excluded.role;
