-- Mon Assiette v2 : données de départ
-- Règle du cahier : rien d'inventé. Les plats ont un nom, une description générale et leurs ingrédients
-- principaux. Pas de durée, de quantité, de prix ni de valeur nutritionnelle tant qu'ils ne sont pas vérifiés.

insert into public.ma2_countries (id, name, timezone, is_active) values
  ('bf', 'Burkina Faso', 'Africa/Ouagadougou', true),
  ('ci', 'Côte d''Ivoire', 'Africa/Abidjan', false),
  ('sn', 'Sénégal', 'Africa/Dakar', false),
  ('ml', 'Mali', 'Africa/Bamako', false),
  ('bj', 'Bénin', 'Africa/Porto-Novo', false),
  ('tg', 'Togo', 'Africa/Lome', false),
  ('ne', 'Niger', 'Africa/Niamey', false),
  ('gn', 'Guinée', 'Africa/Conakry', false);

insert into public.ma2_regions (country_id, name) values
  ('bf', 'Centre (Ouagadougou)'), ('bf', 'Hauts-Bassins (Bobo-Dioulasso)'), ('bf', 'Centre-Ouest (Koudougou)'),
  ('bf', 'Nord (Ouahigouya)'), ('bf', 'Est (Fada N''Gourma)'), ('bf', 'Cascades (Banfora)');

insert into public.ma2_meal_categories (id, name, sort, start_hour) values
  ('petit_dejeuner', 'Petit-déjeuner', 1, 5),
  ('collation', 'Collation du matin', 2, 9),
  ('dejeuner', 'Déjeuner', 3, 11),
  ('gouter', 'Goûter', 4, 15),
  ('diner', 'Dîner', 5, 18);

insert into public.ma2_dietary_preferences (id, name, kind) values
  ('vegetarien', 'Végétarien', 'preference'),
  ('sans_porc', 'Sans porc', 'preference'),
  ('plats_locaux', 'Plats locaux d''abord', 'preference'),
  ('peu_epice', 'Peu épicé', 'preference'),
  ('peu_sucre', 'Moins de sucre', 'restriction'),
  ('peu_sale', 'Moins de sel', 'restriction'),
  ('sans_gluten', 'Sans gluten', 'restriction'),
  ('arachide', 'Arachide', 'allergie'),
  ('poisson', 'Poisson', 'allergie'),
  ('crustaces', 'Crustacés', 'allergie'),
  ('oeuf', 'Œuf', 'allergie'),
  ('lait', 'Lait', 'allergie'),
  ('gluten', 'Gluten (blé)', 'allergie'),
  ('soja', 'Soja', 'allergie'),
  ('sesame', 'Sésame', 'allergie');

insert into public.ma2_ingredients (name, aliases, allergen) values
  ('Farine de petit mil', '{mil}', null),
  ('Farine de sorgho', '{sorgho}', null),
  ('Farine de maïs', '{maïs,mais}', null),
  ('Riz', '{}', null),
  ('Haricot (niébé)', '{haricot,niébé,niebe,benga}', null),
  ('Feuilles de haricot', '{}', null),
  ('Gari', '{semoule de manioc}', null),
  ('Arachide', '{arachides,cacahuète,pâte d''arachide}', 'arachide'),
  ('Sésame', '{}', 'sesame'),
  ('Feuilles de baobab', '{baobab,poudre de baobab}', null),
  ('Gombo', '{}', null),
  ('Feuilles d''oseille', '{oseille,bito}', null),
  ('Poisson fumé', '{poisson séché,poisson}', 'poisson'),
  ('Soumbala', '{soumbara,néré}', null),
  ('Tomate', '{tomates,concentré de tomate}', null),
  ('Oignon', '{oignons}', null),
  ('Huile', '{huile d''arachide,huile végétale}', null),
  ('Viande de bœuf', '{bœuf,boeuf,viande}', null),
  ('Mouton', '{viande de mouton}', null),
  ('Poulet', '{}', null),
  ('Carotte', '{carottes}', null),
  ('Chou', '{}', null),
  ('Igname', '{}', null),
  ('Graines d''acacia (zamnè)', '{zamnè,zamne}', null),
  ('Gingembre', '{}', null),
  ('Citron', '{}', null),
  ('Piment', '{}', null),
  ('Sel', '{}', null),
  ('Sucre', '{}', null),
  ('Mangue', '{mangues}', null);

insert into public.ma2_dishes (slug, name, alt_names, country_id, community, category_id, moments, description, image_url, image_credit, image_license, image_source, allergens, tags, available_countries, status) values
  ('to-mil-sauce-baobab', 'Tô de mil, sauce baobab', '{saghbo}', 'bf', null, 'dejeuner', '{dejeuner,diner}',
   'Pâte ferme de farine de petit mil, servie avec une sauce aux feuilles de baobab séchées. Le tô se mange à la main avec sa sauce.',
   '/photos/to-baobab.jpg', 'Vineke', 'CC0', 'https://commons.wikimedia.org/wiki/File:T%C3%B4_de_petit_mil_avec_sauce_baobab_sec.jpg', '{}', '{local,cereales}', '{bf,ml,ne}', 'publie'),
  ('to-sorgho-sauce-sesame', 'Tô de sorgho, sauce sésame', '{saghbo}', 'bf', null, 'diner', '{dejeuner,diner}',
   'Pâte de farine de sorgho servie avec une sauce au sésame.',
   '/photos/to-sesame.jpg', 'Vineke', 'CC0', 'https://commons.wikimedia.org/wiki/File:T%C3%B4_de_sorgho_avec_sauce_s%C3%A9same.jpg', '{sesame}', '{local,cereales}', '{bf}', 'publie'),
  ('riz-gras', 'Riz gras', '{riz au gras}', 'bf', null, 'dejeuner', '{dejeuner,diner}',
   'Riz cuit avec tomates, oignons, légumes et viande. Un plat souvent servi lors des fêtes en ville.',
   '/photos/riz-gras.jpg', 'Mandanye', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Plat_de_riz_au_gras_plus_viande.jpg', '{}', '{fete}', '{bf,ci,bj,tg,gn,sn}', 'publie'),
  ('gonre', 'Gonré', '{gnonkon,gaonré}', 'bf', 'Mossi', 'gouter', '{gouter,diner}',
   'Petites galettes mossi cuites à la vapeur, à base de haricot, d''arachide et de farine de maïs ou de mil.',
   '/photos/gonre.jpg', 'Yendifa', 'CC BY 4.0', 'https://commons.wikimedia.org/wiki/File:Gonr%C3%A9.jpg', '{arachide}', '{local,vapeur}', '{bf}', 'publie'),
  ('zamne-gonre', 'Zamnè et gonré', '{zamnè}', 'bf', null, 'diner', '{dejeuner,diner}',
   'Graines d''acacia cuites (zamnè), servies ici avec du gonré.',
   '/photos/zamne-gonre.jpg', 'Fasouagadougou', 'CC0', 'https://commons.wikimedia.org/wiki/File:Bol_de_zamn%C3%A8.jpg', '{arachide}', '{local}', '{bf}', 'publie'),
  ('brochettes', 'Brochettes', '{}', 'bf', null, 'gouter', '{gouter,diner}',
   'Morceaux de viande grillés sur des pics, vendus dans la rue et les maquis.',
   '/photos/brochettes.jpg', 'Plume HIEN', 'CC BY 4.0', 'https://commons.wikimedia.org/wiki/File:Des_brochettes_du_Faso.jpg', '{}', '{grillade,rue}', '{bf}', 'publie'),
  ('babenda', 'Babenda', '{}', 'bf', 'Mossi', 'diner', '{dejeuner,diner}',
   'Plat mossi de feuilles (oseille et autres feuilles), cuites avec du soumbala et des brisures de céréales ou de riz.',
   null, null, null, null, '{}', '{local,feuilles}', '{bf}', 'publie'),
  ('haricot-gari', 'Haricot au gari', '{benga}', 'bf', null, 'dejeuner', '{petit_dejeuner,dejeuner}',
   'Haricot (niébé) cuit, servi avec du gari (semoule de manioc) et un filet d''huile.',
   null, null, null, null, '{}', '{local,proteines}', '{bf,ci,bj,tg}', 'publie'),
  ('bouillie-de-mil', 'Bouillie de mil', '{koko}', 'bf', null, 'petit_dejeuner', '{petit_dejeuner}',
   'Bouillie de farine de mil, parfois relevée de citron ou de gingembre.',
   null, null, null, null, '{}', '{local,cereales}', '{bf,ml,ne}', 'publie'),
  ('zoom-koom', 'Zoom-koom', '{zomkom}', 'bf', null, 'collation', '{collation,gouter}',
   'Boisson à base de farine de mil et d''eau, parfumée au gingembre et au citron.',
   null, null, null, null, '{}', '{boisson,local}', '{bf}', 'publie'),
  ('poulet-braise', 'Poulet braisé', '{poulet bicyclette}', 'bf', null, 'diner', '{dejeuner,diner}',
   'Poulet grillé sur la braise, très populaire dans les maquis.',
   null, null, null, null, '{}', '{grillade}', '{bf,ci}', 'publie'),
  ('ragout-igname', 'Ragoût d''igname', '{}', 'bf', null, 'dejeuner', '{dejeuner,diner}',
   'Morceaux d''igname mijotés en sauce.',
   null, null, null, null, '{}', '{local}', '{bf}', 'publie'),
  ('mangue', 'Mangue', '{}', 'bf', null, 'collation', '{collation,gouter}',
   'Fruit de saison, à croquer nature.',
   null, null, null, null, '{}', '{fruit}', '{bf,ml,ci}', 'publie');

-- Ingrédients principaux (sans quantité : à compléter par l'équipe éditoriale)
insert into public.ma2_dish_ingredients (dish_id, ingredient_id, position, is_optional)
select d.id, i.id, x.pos, x.opt
from (values
  ('to-mil-sauce-baobab', 'Farine de petit mil', 1, false), ('to-mil-sauce-baobab', 'Feuilles de baobab', 2, false), ('to-mil-sauce-baobab', 'Soumbala', 3, true), ('to-mil-sauce-baobab', 'Poisson fumé', 4, true), ('to-mil-sauce-baobab', 'Sel', 5, false),
  ('to-sorgho-sauce-sesame', 'Farine de sorgho', 1, false), ('to-sorgho-sauce-sesame', 'Sésame', 2, false), ('to-sorgho-sauce-sesame', 'Sel', 3, false),
  ('riz-gras', 'Riz', 1, false), ('riz-gras', 'Tomate', 2, false), ('riz-gras', 'Oignon', 3, false), ('riz-gras', 'Huile', 4, false), ('riz-gras', 'Viande de bœuf', 5, true), ('riz-gras', 'Carotte', 6, true), ('riz-gras', 'Chou', 7, true),
  ('gonre', 'Haricot (niébé)', 1, false), ('gonre', 'Feuilles de haricot', 2, true), ('gonre', 'Arachide', 3, false), ('gonre', 'Farine de maïs', 4, false),
  ('zamne-gonre', 'Graines d''acacia (zamnè)', 1, false), ('zamne-gonre', 'Haricot (niébé)', 2, false), ('zamne-gonre', 'Arachide', 3, false),
  ('brochettes', 'Viande de bœuf', 1, false), ('brochettes', 'Oignon', 2, true), ('brochettes', 'Piment', 3, true),
  ('babenda', 'Feuilles d''oseille', 1, false), ('babenda', 'Soumbala', 2, false), ('babenda', 'Riz', 3, true), ('babenda', 'Arachide', 4, true),
  ('haricot-gari', 'Haricot (niébé)', 1, false), ('haricot-gari', 'Gari', 2, false), ('haricot-gari', 'Huile', 3, false), ('haricot-gari', 'Oignon', 4, true),
  ('bouillie-de-mil', 'Farine de petit mil', 1, false), ('bouillie-de-mil', 'Citron', 2, true), ('bouillie-de-mil', 'Gingembre', 3, true),
  ('zoom-koom', 'Farine de petit mil', 1, false), ('zoom-koom', 'Gingembre', 2, false), ('zoom-koom', 'Citron', 3, true),
  ('poulet-braise', 'Poulet', 1, false), ('poulet-braise', 'Piment', 2, true), ('poulet-braise', 'Oignon', 3, true),
  ('ragout-igname', 'Igname', 1, false), ('ragout-igname', 'Tomate', 2, false), ('ragout-igname', 'Oignon', 3, false), ('ragout-igname', 'Huile', 4, false),
  ('mangue', 'Mangue', 1, false)
) as x(slug, ing, pos, opt)
join public.ma2_dishes d on d.slug = x.slug
join public.ma2_ingredients i on i.name = x.ing;
