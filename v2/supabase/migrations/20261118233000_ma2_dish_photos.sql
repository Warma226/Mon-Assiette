-- Photos libres (Wikimedia Commons) des plats modernes, copiées dans le stockage public « photos ».
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

update public.ma2_dishes d set image_url = v.url, image_credit = v.credit, image_license = v.lic, image_source = v.src
from (values
  ('bowl-riz-poulet-crudites', 'https://lwyykzcsmykkaoshijsn.supabase.co/storage/v1/object/public/photos/plats/bowl-riz-poulet-crudites.jpg', 'HaJunkiyada', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Liat_Portal_for_Foodie_Disorder_-_Homemade_grilled_chicken_thighs_with_rice_and_Israeli_salad.jpg'),
  ('burger-niebe', 'https://lwyykzcsmykkaoshijsn.supabase.co/storage/v1/object/public/photos/plats/burger-niebe.jpg', 'Sunday Glory', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Akara_with_bread,_good_combination_for_breakfast.jpg'),
  ('omelette-legumes', 'https://lwyykzcsmykkaoshijsn.supabase.co/storage/v1/object/public/photos/plats/omelette-legumes.jpg', 'Gaurav Dhwaj Khadka', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Omelette_1.jpg'),
  ('smoothie-mangue-gingembre', 'https://lwyykzcsmykkaoshijsn.supabase.co/storage/v1/object/public/photos/plats/smoothie-mangue-gingembre.jpg', 'Vivekpat30', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Fresh-mango-smoothie_01.jpg'),
  ('jus-bissap', 'https://lwyykzcsmykkaoshijsn.supabase.co/storage/v1/object/public/photos/plats/jus-bissap.jpg', 'Ghay O', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Jus_de_bissap_local.jpg'),
  ('salade-avocat-tomate', 'https://lwyykzcsmykkaoshijsn.supabase.co/storage/v1/object/public/photos/plats/salade-avocat-tomate.jpg', 'Horacio Cambeiro', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Avocado_salad_in_Argentina.jpg'),
  ('poisson-braise-attieke', 'https://lwyykzcsmykkaoshijsn.supabase.co/storage/v1/object/public/photos/plats/poisson-braise-attieke.jpg', 'Papischou', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Atti%C3%A9k%C3%A9_au_poisson_grill%C3%A9e.JPG'),
  ('brochettes-frites-igname', 'https://lwyykzcsmykkaoshijsn.supabase.co/storage/v1/object/public/photos/plats/brochettes-frites-igname.jpg', 'Benoît Prieur', 'CC0', 'https://commons.wikimedia.org/wiki/File:Brochettes_de_poulet_marin%C3%A9_en_fin_de_cuisson_au_barbecue_(avril_2020).jpg'),
  ('degue-lait-caille', 'https://lwyykzcsmykkaoshijsn.supabase.co/storage/v1/object/public/photos/plats/degue-lait-caille.jpg', 'BeraDigle', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Du_d%C3%AAgu%C3%AA.jpg'),
  ('puree-patate-poulet', 'https://lwyykzcsmykkaoshijsn.supabase.co/storage/v1/object/public/photos/plats/puree-patate-poulet.jpg', 'Shark2025', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Grilled_chicken_with_mashed_potatoes_fresh_salad.jpg'),
  ('tartine-avocat-oeuf', 'https://lwyykzcsmykkaoshijsn.supabase.co/storage/v1/object/public/photos/plats/tartine-avocat-oeuf.jpg', 'Asramsey', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Fresh_Avocado_Toast_with_Egg.jpg')
) as v(slug, url, credit, lic, src)
where d.slug = v.slug and d.image_url is null;
