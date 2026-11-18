-- Fin de soirée : seuls les plats légers et faciles à digérer sont proposés.
alter table public.ma2_dishes add column if not exists is_light boolean not null default false;
comment on column public.ma2_dishes.is_light is 'Léger et facile à digérer : peut être proposé tard le soir';
update public.ma2_dishes set is_light = true
where slug in ('mangue', 'salade-avocat-tomate', 'smoothie-mangue-gingembre', 'bouillie-de-mil');
