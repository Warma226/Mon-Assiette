-- Projet Supabase dédié à Mon Assiette (lwyykzcsmykkaoshijsn), séparé de TUVOA.
-- Le profil est créé dès l'inscription ; les rappels sont envoyés toutes les 5 minutes.
create or replace function public.ma2_on_signup() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.ma2_profiles (id, display_name)
  values (new.id, nullif(left(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), 60), ''))
  on conflict (id) do nothing;
  return new;
end $$;
revoke execute on function public.ma2_on_signup() from public, anon, authenticated;
create trigger ma2_on_signup after insert on auth.users for each row execute function public.ma2_on_signup();

create or replace function public.ma2_push_config() returns json
language sql stable security definer set search_path = '' as $$
  select json_build_object(
    'vapid', (select decrypted_secret from vault.decrypted_secrets where name = 'ma2_vapid_private'),
    'cron', (select decrypted_secret from vault.decrypted_secrets where name = 'ma2_cron_secret'));
$$;
revoke execute on function public.ma2_push_config() from public, anon, authenticated;
grant execute on function public.ma2_push_config() to service_role;

create extension if not exists pg_net;
create extension if not exists pg_cron;
-- Les secrets ma2_vapid_private et ma2_cron_secret sont créés à la main dans le coffre (Vault).
select cron.schedule('ma2-push-reminders', '*/5 * * * *', $$
  select net.http_post(
    url := 'https://lwyykzcsmykkaoshijsn.supabase.co/functions/v1/ma2-push',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'ma2_cron_secret')),
    body := '{}'::jsonb);
$$);
