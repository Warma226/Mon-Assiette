-- Clés des services externes rangées dans le coffre (Vault), lisibles seulement par les fonctions serveur
create or replace function public.ma2_get_secret(p_name text) returns text
language sql stable security definer set search_path = '' as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'ma2_' || lower(p_name) limit 1;
$$;
revoke execute on function public.ma2_get_secret(text) from public, anon, authenticated;
grant execute on function public.ma2_get_secret(text) to service_role;

create or replace function public.ma2_store_secret(p_name text, p_value text) returns void
language plpgsql security definer set search_path = '' as $$
declare sid uuid; n text := 'ma2_' || lower(p_name);
begin
  if p_name not in ('CHARIOW_API_KEY', 'GROQ_API_KEY', 'GOOGLE_PLACES_API_KEY') or coalesce(p_value, '') = '' then return; end if;
  select id into sid from vault.secrets where name = n;
  if sid is null then perform vault.create_secret(p_value, n); else perform vault.update_secret(sid, p_value); end if;
end $$;
revoke execute on function public.ma2_store_secret(text, text) from public, anon, authenticated;
grant execute on function public.ma2_store_secret(text, text) to service_role;
