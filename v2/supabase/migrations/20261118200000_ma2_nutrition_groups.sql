-- Groupes d'aliments (classification FAO / OMS simplifiée) pour composer des repas équilibrés
alter table public.ma2_ingredients add column if not exists food_group text
  check (food_group in ('cereales', 'legumineuses', 'legumes', 'fruits', 'proteines', 'laitiers', 'matieres_grasses', 'sucres', 'condiments'));
update public.ma2_ingredients set food_group = case
  when name in ('Riz','Farine de maïs','Farine de petit mil','Farine de sorgho','Gari','Igname','Fonio','Attiéké','Pain','Pomme de terre') then 'cereales'
  when name in ('Haricot (niébé)','Arachide','Sésame','Graines d''acacia (zamnè)') then 'legumineuses'
  when name in ('Carotte','Chou','Tomate','Gombo','Feuilles d''oseille','Feuilles de baobab','Feuilles de haricot','Concombre') then 'legumes'
  when name in ('Mangue','Avocat') then 'fruits'
  when name in ('Poulet','Viande de bœuf','Mouton','Poisson frais','Poisson fumé','Œuf') then 'proteines'
  when name in ('Lait caillé') then 'laitiers'
  when name in ('Huile') then 'matieres_grasses'
  when name in ('Sucre') then 'sucres'
  else 'condiments' end
where food_group is null;
alter table public.ma2_dishes add column if not exists is_fried boolean not null default false;
alter table public.ma2_dishes add column if not exists is_sweet boolean not null default false;
update public.ma2_dishes set is_fried = true where slug in ('brochettes-frites-igname');
update public.ma2_dishes d set is_sweet = true where exists (
  select 1 from public.ma2_dish_ingredients di join public.ma2_ingredients i on i.id = di.ingredient_id
  where di.dish_id = d.id and i.food_group = 'sucres');
update public.ma2_dishes set moments = array['dejeuner'] where slug = 'haricot-gari';
