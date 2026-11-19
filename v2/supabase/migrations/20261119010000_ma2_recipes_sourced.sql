-- Recettes, durées, portions et niveaux tirés de sources publiées (voir colonne source).
update public.ma2_dishes set prep_minutes = coalesce(null, prep_minutes), servings = coalesce(4, servings), difficulty = coalesce('facile', difficulty) where slug = 'babenda';
insert into public.ma2_recipes (dish_id, source, verified_at) select id, 'IRSAT/CNRST, « Mets et produits traditionnels du Centre-Nord, Burkina Faso » (2023) — https://www.ccrp.org/wp-content/uploads/2023/12/Mets-et-Produits-Traditionnels-du-Centre-Nord.pdf ; portions : Together Women Rise — https://togetherwomenrise.org/recipes/babenda/', now() from public.ma2_dishes where slug = 'babenda' on conflict (dish_id) do update set source = excluded.source, verified_at = now();
delete from public.ma2_recipe_steps where recipe_id = (select r.id from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where d.slug = 'babenda');
insert into public.ma2_recipe_steps (recipe_id, position, body) select r.id, v.p, v.b from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id, (values
  (1, 'Concasser la céréale (ici le riz) en semoule moyenne.'),
  (2, 'Faire cuire les feuilles dans de l’eau bouillante, puis ajouter les feuilles d’oseille.'),
  (3, 'Verser la semoule dans les feuilles et laisser cuire quelques minutes.'),
  (4, 'Ajouter l’arachide en poudre et le soumbala, puis remuer jusqu’à la fin de la cuisson.'),
  (5, 'Servir chaud avec un filet d’huile et un peu de sel.')
) as v(p, b) where d.slug = 'babenda';
update public.ma2_dishes set prep_minutes = coalesce(null, prep_minutes), servings = coalesce(null, servings), difficulty = coalesce(null, difficulty) where slug = 'bouillie-de-mil';
insert into public.ma2_recipes (dish_id, source, verified_at) select id, 'IRSAT/CNRST, « Mets et produits traditionnels du Centre-Nord, Burkina Faso » (2023) — https://www.ccrp.org/wp-content/uploads/2023/12/Mets-et-Produits-Traditionnels-du-Centre-Nord.pdf (bouillie ben-kida)', now() from public.ma2_dishes where slug = 'bouillie-de-mil' on conflict (dish_id) do update set source = excluded.source, verified_at = now();
delete from public.ma2_recipe_steps where recipe_id = (select r.id from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where d.slug = 'bouillie-de-mil');
insert into public.ma2_recipe_steps (recipe_id, position, body) select r.id, v.p, v.b from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id, (values
  (1, 'Moudre le mil puis tamiser la farine.'),
  (2, 'Mélanger une partie de la farine avec un peu d’eau pour former de petits grumeaux, et délayer le reste dans de l’eau froide (lait de farine).'),
  (3, 'Faire cuire les grumeaux dans l’eau bouillante, puis ajouter le lait de farine en remuant.'),
  (4, 'Parfumer au citron et au gingembre, et servir chaude, avec du lait ou du yaourt si on le souhaite.')
) as v(p, b) where d.slug = 'bouillie-de-mil';
update public.ma2_dishes set prep_minutes = coalesce(30, prep_minutes), servings = coalesce(4, servings), difficulty = coalesce('facile', difficulty) where slug = 'brochettes';
insert into public.ma2_recipes (dish_id, source, verified_at) select id, 'Demotivateur Food, « Brochettes de bœuf mariné » — https://www.demotivateur.fr/food/recette/brochettes-de-boeuf-marine-327', now() from public.ma2_dishes where slug = 'brochettes' on conflict (dish_id) do update set source = excluded.source, verified_at = now();
delete from public.ma2_recipe_steps where recipe_id = (select r.id from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where d.slug = 'brochettes');
insert into public.ma2_recipe_steps (recipe_id, position, body) select r.id, v.p, v.b from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id, (values
  (1, 'Couper la viande en cubes de taille égale.'),
  (2, 'Mélanger avec l’oignon émincé, le piment, un filet d’huile et du sel, et laisser mariner.'),
  (3, 'Enfiler les morceaux sur des piques en alternant avec l’oignon.'),
  (4, 'Griller environ 15 minutes sur la braise ou au four, en retournant à mi-cuisson.')
) as v(p, b) where d.slug = 'brochettes';
update public.ma2_dishes set prep_minutes = coalesce(45, prep_minutes), servings = coalesce(4, servings), difficulty = coalesce('facile', difficulty) where slug = 'brochettes-frites-igname';
insert into public.ma2_recipes (dish_id, source, verified_at) select id, 'Brochettes : Demotivateur Food — https://www.demotivateur.fr/food/recette/brochettes-de-boeuf-marine-327 ; frites d’igname au four : Croq’Kilos — https://www.croq-kilos.com/actus/l-igname-tout-savoir-sur-ce-legume-aux-multiples-bienfaits', now() from public.ma2_dishes where slug = 'brochettes-frites-igname' on conflict (dish_id) do update set source = excluded.source, verified_at = now();
delete from public.ma2_recipe_steps where recipe_id = (select r.id from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where d.slug = 'brochettes-frites-igname');
insert into public.ma2_recipe_steps (recipe_id, position, body) select r.id, v.p, v.b from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id, (values
  (1, 'Faire mariner les morceaux de poulet avec l’oignon, le piment, un filet d’huile et le sel.'),
  (2, 'Éplucher l’igname et la couper en bâtonnets, puis les enrober d’un peu d’huile et de sel.'),
  (3, 'Cuire les bâtonnets d’igname au four bien chaud (200 °C) environ 30 minutes, en les retournant à mi-cuisson.'),
  (4, 'Pendant ce temps, enfiler le poulet sur des piques et le griller environ 15 minutes en retournant.'),
  (5, 'Servir les brochettes avec les frites d’igname.')
) as v(p, b) where d.slug = 'brochettes-frites-igname';
update public.ma2_dishes set prep_minutes = coalesce(35, prep_minutes), servings = coalesce(4, servings), difficulty = coalesce(null, difficulty) where slug = 'burger-niebe';
insert into public.ma2_recipes (dish_id, source, verified_at) select id, 'Adapté du burger végétarien d’Extenso (Université de Montréal) pour la Fondation OLO, avec du niébé à la place des haricots en conserve — https://fondationolo.ca/media/ymri1ixt/fondation-olo-recette-burger-vegetarien.pdf', now() from public.ma2_dishes where slug = 'burger-niebe' on conflict (dish_id) do update set source = excluded.source, verified_at = now();
delete from public.ma2_recipe_steps where recipe_id = (select r.id from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where d.slug = 'burger-niebe');
insert into public.ma2_recipe_steps (recipe_id, position, body) select r.id, v.p, v.b from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id, (values
  (1, 'Faire cuire le niébé jusqu’à ce qu’il soit tendre, puis l’égoutter.'),
  (2, 'L’écraser à la fourchette avec l’oignon haché, le piment et le sel jusqu’à pouvoir former des galettes.'),
  (3, 'Façonner des galettes et les dorer à la poêle avec un peu d’huile, quelques minutes de chaque côté.'),
  (4, 'Garnir le pain avec la galette, des tranches de tomate et du chou émincé.')
) as v(p, b) where d.slug = 'burger-niebe';
update public.ma2_dishes set prep_minutes = coalesce(35, prep_minutes), servings = coalesce(4, servings), difficulty = coalesce('facile', difficulty) where slug = 'degue-lait-caille';
insert into public.ma2_recipes (dish_id, source, verified_at) select id, 'NKOSI, « Recette Thiakry (dèguè) » — https://www.nkosiagro.com/blogs/culture-africaine/recette-thiakry', now() from public.ma2_dishes where slug = 'degue-lait-caille' on conflict (dish_id) do update set source = excluded.source, verified_at = now();
delete from public.ma2_recipe_steps where recipe_id = (select r.id from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where d.slug = 'degue-lait-caille');
insert into public.ma2_recipe_steps (recipe_id, position, body) select r.id, v.p, v.b from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id, (values
  (1, 'Rouler la farine de mil humidifiée entre les mains pour former de petits grains.'),
  (2, 'Cuire les grains à la vapeur quelques minutes, puis les égrener et laisser refroidir.'),
  (3, 'Mélanger le lait caillé avec le sucre.'),
  (4, 'Verser le lait caillé sucré sur les grains de mil et servir bien frais.')
) as v(p, b) where d.slug = 'degue-lait-caille';
update public.ma2_dishes set prep_minutes = coalesce(null, prep_minutes), servings = coalesce(null, servings), difficulty = coalesce(null, difficulty) where slug = 'gonre';
insert into public.ma2_recipes (dish_id, source, verified_at) select id, 'IRSAT/CNRST, « Mets et produits traditionnels du Centre-Nord, Burkina Faso » (2023) — https://www.ccrp.org/wp-content/uploads/2023/12/Mets-et-Produits-Traditionnels-du-Centre-Nord.pdf', now() from public.ma2_dishes where slug = 'gonre' on conflict (dish_id) do update set source = excluded.source, verified_at = now();
delete from public.ma2_recipe_steps where recipe_id = (select r.id from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where d.slug = 'gonre');
insert into public.ma2_recipe_steps (recipe_id, position, body) select r.id, v.p, v.b from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id, (values
  (1, 'Faire tremper le niébé environ 4 heures, puis l’écraser pour obtenir une pâte.'),
  (2, 'Mélanger un quart de la farine avec la pâte de niébé.'),
  (3, 'Pétrir en ajoutant de l’eau petit à petit, puis incorporer le reste de la farine, les feuilles de haricot et l’arachide.'),
  (4, 'Former des boules ou des boudins et les cuire à la vapeur.'),
  (5, 'Servir avec un filet d’huile et un peu de sel.')
) as v(p, b) where d.slug = 'gonre';
update public.ma2_dishes set prep_minutes = coalesce(20, prep_minutes), servings = coalesce(4, servings), difficulty = coalesce('facile', difficulty) where slug = 'jus-bissap';
insert into public.ma2_recipes (dish_id, source, verified_at) select id, 'NKOSI, « Recette Bissap » — https://www.nkosiagro.com/blogs/culture-africaine/recette-bissap ; étapes : Allo Docteurs Africa — https://www.allodocteurs.fr/bissap-gingembre-pasteque-5-recettes-pour-des-jus-qui-nous-veulent-du-bien-44344.html', now() from public.ma2_dishes where slug = 'jus-bissap' on conflict (dish_id) do update set source = excluded.source, verified_at = now();
delete from public.ma2_recipe_steps where recipe_id = (select r.id from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where d.slug = 'jus-bissap');
insert into public.ma2_recipe_steps (recipe_id, position, body) select r.id, v.p, v.b from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id, (values
  (1, 'Rincer les fleurs de bissap.'),
  (2, 'Les faire bouillir dans l’eau avec le gingembre râpé pendant environ 20 minutes.'),
  (3, 'Filtrer, puis allonger avec de l’eau.'),
  (4, 'Sucrer légèrement et servir frais.')
) as v(p, b) where d.slug = 'jus-bissap';
update public.ma2_dishes set prep_minutes = coalesce(15, prep_minutes), servings = coalesce(2, servings), difficulty = coalesce('facile', difficulty) where slug = 'omelette-legumes';
insert into public.ma2_recipes (dish_id, source, verified_at) select id, 'NR Magazine, « Omelette aux légumes » — https://www.nrmagazine.com/repas-rapides-diner-sans-stress/', now() from public.ma2_dishes where slug = 'omelette-legumes' on conflict (dish_id) do update set source = excluded.source, verified_at = now();
delete from public.ma2_recipe_steps where recipe_id = (select r.id from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where d.slug = 'omelette-legumes');
insert into public.ma2_recipe_steps (recipe_id, position, body) select r.id, v.p, v.b from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id, (values
  (1, 'Émincer l’oignon, couper la tomate en dés et hacher un peu de piment.'),
  (2, 'Faire revenir les légumes quelques minutes dans un peu d’huile.'),
  (3, 'Battre les œufs avec le sel et les verser sur les légumes.'),
  (4, 'Laisser cuire à feu doux jusqu’à ce que l’omelette soit prise, puis plier et servir.')
) as v(p, b) where d.slug = 'omelette-legumes';
update public.ma2_dishes set prep_minutes = coalesce(50, prep_minutes), servings = coalesce(4, servings), difficulty = coalesce('facile', difficulty) where slug = 'poisson-braise-attieke';
insert into public.ma2_recipes (dish_id, source, verified_at) select id, 'NKOSI, « Recette Attiéké au poisson » — https://www.nkosiagro.com/blogs/culture-africaine/attieke-au-poisson', now() from public.ma2_dishes where slug = 'poisson-braise-attieke' on conflict (dish_id) do update set source = excluded.source, verified_at = now();
delete from public.ma2_recipe_steps where recipe_id = (select r.id from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where d.slug = 'poisson-braise-attieke');
insert into public.ma2_recipe_steps (recipe_id, position, body) select r.id, v.p, v.b from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id, (values
  (1, 'Nettoyer le poisson, l’inciser et le frotter avec du citron, du piment et du sel.'),
  (2, 'Griller le poisson sur la braise en le retournant.'),
  (3, 'Égrener l’attiéké avec les doigts et le réchauffer à la vapeur environ 5 minutes.'),
  (4, 'Couper tomate et oignon en dés, assaisonner de citron et d’un filet d’huile.'),
  (5, 'Servir le poisson sur l’attiéké avec la salade.')
) as v(p, b) where d.slug = 'poisson-braise-attieke';
update public.ma2_dishes set prep_minutes = coalesce(55, prep_minutes), servings = coalesce(4, servings), difficulty = coalesce('facile', difficulty) where slug = 'poulet-braise';
insert into public.ma2_recipes (dish_id, source, verified_at) select id, 'Circulaire-en-ligne, « Poulet braisé africain facile » — https://www.circulaire-en-ligne.ca/recette/poulet-braise-africaine-facile', now() from public.ma2_dishes where slug = 'poulet-braise' on conflict (dish_id) do update set source = excluded.source, verified_at = now();
delete from public.ma2_recipe_steps where recipe_id = (select r.id from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where d.slug = 'poulet-braise');
insert into public.ma2_recipe_steps (recipe_id, position, body) select r.id, v.p, v.b from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id, (values
  (1, 'Découper le poulet en morceaux et les inciser.'),
  (2, 'Mixer l’oignon et le piment avec du sel, puis enduire le poulet de cette marinade.'),
  (3, 'Laisser mariner, au mieux quelques heures.'),
  (4, 'Griller sur la braise ou au four en retournant à mi-cuisson, jusqu’à ce que la chair soit bien cuite.')
) as v(p, b) where d.slug = 'poulet-braise';
update public.ma2_dishes set prep_minutes = coalesce(60, prep_minutes), servings = coalesce(6, servings), difficulty = coalesce(null, difficulty) where slug = 'ragout-igname';
insert into public.ma2_recipes (dish_id, source, verified_at) select id, 'Afrik.com, « Ignames à la sauce tomate (Burkina Faso) » — https://www.afrik.com/ignames-a-la-sauce-tomate-burkina-faso', now() from public.ma2_dishes where slug = 'ragout-igname' on conflict (dish_id) do update set source = excluded.source, verified_at = now();
delete from public.ma2_recipe_steps where recipe_id = (select r.id from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where d.slug = 'ragout-igname');
insert into public.ma2_recipe_steps (recipe_id, position, body) select r.id, v.p, v.b from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id, (values
  (1, 'Éplucher l’igname et la couper en morceaux épais.'),
  (2, 'Faire revenir l’oignon dans l’huile, puis ajouter la tomate.'),
  (3, 'Ajouter l’igname et un peu d’eau, couvrir.'),
  (4, 'Laisser cuire à petit feu jusqu’à ce que l’igname soit tendre, en ajoutant de l’eau si besoin.')
) as v(p, b) where d.slug = 'ragout-igname';
update public.ma2_dishes set prep_minutes = coalesce(90, prep_minutes), servings = coalesce(4, servings), difficulty = coalesce('moyen', difficulty) where slug = 'riz-gras';
insert into public.ma2_recipes (dish_id, source, verified_at) select id, 'NKOSI, « Recette Riz gras » — https://www.nkosiagro.com/blogs/culture-africaine/recette-riz-gras ; préparation : Afrik.com — https://www.afrik.com/riz-au-gras-burkina-faso', now() from public.ma2_dishes where slug = 'riz-gras' on conflict (dish_id) do update set source = excluded.source, verified_at = now();
delete from public.ma2_recipe_steps where recipe_id = (select r.id from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where d.slug = 'riz-gras');
insert into public.ma2_recipe_steps (recipe_id, position, body) select r.id, v.p, v.b from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id, (values
  (1, 'Laver le riz et le laisser tremper.'),
  (2, 'Faire revenir la viande dans l’huile avec l’oignon, puis ajouter la tomate.'),
  (3, 'Ajouter la carotte et le chou coupés en morceaux, puis de l’eau, et porter à ébullition.'),
  (4, 'Verser le riz égoutté, baisser le feu au minimum et laisser cuire jusqu’à ce que le riz soit tendre.')
) as v(p, b) where d.slug = 'riz-gras';
update public.ma2_dishes set prep_minutes = coalesce(10, prep_minutes), servings = coalesce(2, servings), difficulty = coalesce('facile', difficulty) where slug = 'salade-avocat-tomate';
insert into public.ma2_recipes (dish_id, source, verified_at) select id, 'Elle Belgique, « Salade d’avocat, tomates et poivron » — https://www.elle.be/fr/?p=199431', now() from public.ma2_dishes where slug = 'salade-avocat-tomate' on conflict (dish_id) do update set source = excluded.source, verified_at = now();
delete from public.ma2_recipe_steps where recipe_id = (select r.id from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where d.slug = 'salade-avocat-tomate');
insert into public.ma2_recipe_steps (recipe_id, position, body) select r.id, v.p, v.b from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id, (values
  (1, 'Couper l’avocat, la tomate et l’oignon en petits dés.'),
  (2, 'Mélanger le tout dans un saladier.'),
  (3, 'Arroser de jus de citron, saler et servir aussitôt.')
) as v(p, b) where d.slug = 'salade-avocat-tomate';
update public.ma2_dishes set prep_minutes = coalesce(40, prep_minutes), servings = coalesce(2, servings), difficulty = coalesce(null, difficulty) where slug = 'salade-fonio-legumes';
insert into public.ma2_recipes (dish_id, source, verified_at) select id, 'Afrik.com, « Taboulé de fonio » — https://www.afrik.com/taboule-de-fonio', now() from public.ma2_dishes where slug = 'salade-fonio-legumes' on conflict (dish_id) do update set source = excluded.source, verified_at = now();
delete from public.ma2_recipe_steps where recipe_id = (select r.id from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where d.slug = 'salade-fonio-legumes');
insert into public.ma2_recipe_steps (recipe_id, position, body) select r.id, v.p, v.b from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id, (values
  (1, 'Verser de l’eau bouillante sur le fonio, couvrir et laisser gonfler environ 15 minutes.'),
  (2, 'Égrener le fonio et le laisser refroidir.'),
  (3, 'Couper le concombre, la tomate et l’oignon en petits dés.'),
  (4, 'Mélanger avec le fonio, assaisonner de citron, d’huile et de sel, et servir tiède ou froid.')
) as v(p, b) where d.slug = 'salade-fonio-legumes';
update public.ma2_dishes set prep_minutes = coalesce(5, prep_minutes), servings = coalesce(2, servings), difficulty = coalesce('facile', difficulty) where slug = 'smoothie-mangue-gingembre';
insert into public.ma2_recipes (dish_id, source, verified_at) select id, 'Demotivateur Food, « Smoothie énergisant à la mangue, orange et épices » — https://www.demotivateur.fr/food/recette/smoothie-energisant-a-la-mangue-orange-et-epices-1759', now() from public.ma2_dishes where slug = 'smoothie-mangue-gingembre' on conflict (dish_id) do update set source = excluded.source, verified_at = now();
delete from public.ma2_recipe_steps where recipe_id = (select r.id from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where d.slug = 'smoothie-mangue-gingembre');
insert into public.ma2_recipe_steps (recipe_id, position, body) select r.id, v.p, v.b from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id, (values
  (1, 'Éplucher la mangue et la couper en morceaux.'),
  (2, 'Mixer avec un peu de gingembre, le jus de citron et un peu d’eau.'),
  (3, 'Servir aussitôt, bien frais.')
) as v(p, b) where d.slug = 'smoothie-mangue-gingembre';
update public.ma2_dishes set prep_minutes = coalesce(11, prep_minutes), servings = coalesce(2, servings), difficulty = coalesce('facile', difficulty) where slug = 'tartine-avocat-oeuf';
insert into public.ma2_recipes (dish_id, source, verified_at) select id, 'Demotivateur Food, « Tartine à l’avocat et œuf coulant » — https://www.demotivateur.fr/food/recette/tartine-a-l-avocat-feta-et-oeuf-coulant-3032', now() from public.ma2_dishes where slug = 'tartine-avocat-oeuf' on conflict (dish_id) do update set source = excluded.source, verified_at = now();
delete from public.ma2_recipe_steps where recipe_id = (select r.id from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where d.slug = 'tartine-avocat-oeuf');
insert into public.ma2_recipe_steps (recipe_id, position, body) select r.id, v.p, v.b from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id, (values
  (1, 'Faire griller les tranches de pain.'),
  (2, 'Écraser l’avocat avec un peu de citron et de sel.'),
  (3, 'Cuire les œufs (au plat ou mollets, environ 6 minutes).'),
  (4, 'Étaler l’avocat sur le pain, poser l’œuf dessus et servir.')
) as v(p, b) where d.slug = 'tartine-avocat-oeuf';
update public.ma2_dishes set prep_minutes = coalesce(null, prep_minutes), servings = coalesce(null, servings), difficulty = coalesce(null, difficulty) where slug = 'to-mil-sauce-baobab';
insert into public.ma2_recipes (dish_id, source, verified_at) select id, 'IRSAT/CNRST, « Mets et produits traditionnels du Centre-Nord, Burkina Faso » (2023) — https://www.ccrp.org/wp-content/uploads/2023/12/Mets-et-Produits-Traditionnels-du-Centre-Nord.pdf (tô)', now() from public.ma2_dishes where slug = 'to-mil-sauce-baobab' on conflict (dish_id) do update set source = excluded.source, verified_at = now();
delete from public.ma2_recipe_steps where recipe_id = (select r.id from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where d.slug = 'to-mil-sauce-baobab');
insert into public.ma2_recipe_steps (recipe_id, position, body) select r.id, v.p, v.b from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id, (values
  (1, 'Délayer un quart de la farine dans de l’eau froide pour faire un lait de farine.'),
  (2, 'Porter de l’eau à ébullition, verser le lait de farine et laisser cuire en remuant.'),
  (3, 'Incorporer peu à peu le reste de la farine en malaxant à la spatule jusqu’à obtenir une pâte souple, puis servir en petites boules.'),
  (4, 'Pour la sauce, cuire les feuilles de baobab dans l’eau avec le soumbala, le poisson fumé et le sel.')
) as v(p, b) where d.slug = 'to-mil-sauce-baobab';
update public.ma2_dishes set prep_minutes = coalesce(null, prep_minutes), servings = coalesce(null, servings), difficulty = coalesce(null, difficulty) where slug = 'to-sorgho-sauce-sesame';
insert into public.ma2_recipes (dish_id, source, verified_at) select id, 'IRSAT/CNRST, « Mets et produits traditionnels du Centre-Nord, Burkina Faso » (2023) — https://www.ccrp.org/wp-content/uploads/2023/12/Mets-et-Produits-Traditionnels-du-Centre-Nord.pdf (tô)', now() from public.ma2_dishes where slug = 'to-sorgho-sauce-sesame' on conflict (dish_id) do update set source = excluded.source, verified_at = now();
delete from public.ma2_recipe_steps where recipe_id = (select r.id from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where d.slug = 'to-sorgho-sauce-sesame');
insert into public.ma2_recipe_steps (recipe_id, position, body) select r.id, v.p, v.b from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id, (values
  (1, 'Délayer un quart de la farine de sorgho dans de l’eau froide pour faire un lait de farine.'),
  (2, 'Porter de l’eau à ébullition, verser le lait de farine et laisser cuire en remuant.'),
  (3, 'Incorporer peu à peu le reste de la farine en malaxant jusqu’à obtenir une pâte souple, puis servir en petites boules.'),
  (4, 'Pour la sauce, griller puis moudre le sésame et le cuire dans l’eau salée jusqu’à épaississement.')
) as v(p, b) where d.slug = 'to-sorgho-sauce-sesame';
update public.ma2_dishes set prep_minutes = coalesce(null, prep_minutes), servings = coalesce(null, servings), difficulty = coalesce(null, difficulty) where slug = 'zamne-gonre';
insert into public.ma2_recipes (dish_id, source, verified_at) select id, 'Vikidia, « Zamnè » — https://fr.vikidia.org/wiki/Zamn%C3%A8 ; gonré : IRSAT/CNRST, « Mets et produits traditionnels du Centre-Nord, Burkina Faso » (2023) — https://www.ccrp.org/wp-content/uploads/2023/12/Mets-et-Produits-Traditionnels-du-Centre-Nord.pdf', now() from public.ma2_dishes where slug = 'zamne-gonre' on conflict (dish_id) do update set source = excluded.source, verified_at = now();
delete from public.ma2_recipe_steps where recipe_id = (select r.id from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where d.slug = 'zamne-gonre');
insert into public.ma2_recipe_steps (recipe_id, position, body) select r.id, v.p, v.b from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id, (values
  (1, 'Trier et laver les graines de zamnè.'),
  (2, 'Les cuire une première fois environ 1 heure dans l’eau bouillante, avec un peu de potasse pour accélérer la cuisson.'),
  (3, 'Égoutter, rincer et poursuivre la cuisson jusqu’à ce que les graines soient tendres.'),
  (4, 'Servir avec le gonré (pâte de niébé cuite à la vapeur) et un peu d’arachide.')
) as v(p, b) where d.slug = 'zamne-gonre';
update public.ma2_dishes set prep_minutes = coalesce(null, prep_minutes), servings = coalesce(null, servings), difficulty = coalesce(null, difficulty) where slug = 'zoom-koom';
insert into public.ma2_recipes (dish_id, source, verified_at) select id, 'IRSAT/CNRST, « Mets et produits traditionnels du Centre-Nord, Burkina Faso » (2023) — https://www.ccrp.org/wp-content/uploads/2023/12/Mets-et-Produits-Traditionnels-du-Centre-Nord.pdf', now() from public.ma2_dishes where slug = 'zoom-koom' on conflict (dish_id) do update set source = excluded.source, verified_at = now();
delete from public.ma2_recipe_steps where recipe_id = (select r.id from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where d.slug = 'zoom-koom');
insert into public.ma2_recipe_steps (recipe_id, position, body) select r.id, v.p, v.b from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id, (values
  (1, 'Laver et trier le mil, puis le faire tremper 12 à 16 heures.'),
  (2, 'Le moudre finement avec le gingembre.'),
  (3, 'Malaxer la farine humide avec de l’eau, puis filtrer.'),
  (4, 'Ajouter du citron et, si on le souhaite, un peu de sucre ou de miel. Servir frais.')
) as v(p, b) where d.slug = 'zoom-koom';
update public.ma2_dishes set prep_minutes = coalesce(null, prep_minutes), servings = coalesce(null, servings), difficulty = coalesce(null, difficulty) where slug = 'puree-patate-poulet';
insert into public.ma2_recipes (dish_id, source, verified_at) select id, 'Purée : Afrik.com, « Purée de pommes de terre » — https://www.afrik.com/puree-de-pommes-de-terre', now() from public.ma2_dishes where slug = 'puree-patate-poulet' on conflict (dish_id) do update set source = excluded.source, verified_at = now();
delete from public.ma2_recipe_steps where recipe_id = (select r.id from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id where d.slug = 'puree-patate-poulet');
insert into public.ma2_recipe_steps (recipe_id, position, body) select r.id, v.p, v.b from public.ma2_recipes r join public.ma2_dishes d on d.id = r.dish_id, (values
  (1, 'Éplucher, laver et couper les pommes de terre en morceaux.'),
  (2, 'Les cuire à l’eau salée 30 à 40 minutes, jusqu’à ce qu’elles soient tendres, puis les écraser.'),
  (3, 'Pendant ce temps, faire dorer le poulet dans un peu d’huile avec l’oignon.'),
  (4, 'Ajouter la tomate et laisser mijoter jusqu’à ce que le poulet soit bien cuit.'),
  (5, 'Servir le poulet et sa sauce avec la purée.')
) as v(p, b) where d.slug = 'puree-patate-poulet';
