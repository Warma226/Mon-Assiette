-- Photos libres (Wikimedia Commons) des plats traditionnels.
update public.ma2_dishes d set image_url = v.url, image_credit = v.credit, image_license = v.lic, image_source = v.src
from (values
  ('babenda', 'https://lwyykzcsmykkaoshijsn.supabase.co/storage/v1/object/public/photos/plats/babenda.jpg', 'Ibrahim Somgalia Guitti', 'CC0', 'https://commons.wikimedia.org/wiki/File:Plat_de_babenda.jpg'),
  ('bouillie-de-mil', 'https://lwyykzcsmykkaoshijsn.supabase.co/storage/v1/object/public/photos/plats/bouillie-de-mil.jpg', 'Zakouski', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Bouillie_de_mil_et_galettes.jpg'),
  ('haricot-gari', 'https://lwyykzcsmykkaoshijsn.supabase.co/storage/v1/object/public/photos/plats/haricot-gari.jpg', 'Umuhiera', 'CC0', 'https://commons.wikimedia.org/wiki/File:Beans_with_Gari.jpg'),
  ('mangue', 'https://lwyykzcsmykkaoshijsn.supabase.co/storage/v1/object/public/photos/plats/mangue.jpg', 'Zenyrgarden', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Yellow_Mango_slices.jpg'),
  ('poulet-braise', 'https://lwyykzcsmykkaoshijsn.supabase.co/storage/v1/object/public/photos/plats/poulet-braise.jpg', 'Zak Le Messager', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Poulet_brais%C3%A9_oignons.jpg'),
  ('ragout-igname', 'https://lwyykzcsmykkaoshijsn.supabase.co/storage/v1/object/public/photos/plats/ragout-igname.jpg', 'Akouete', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Rago%C3%BBt_d%27igname_(T%C3%A9ba).jpg'),
  ('zoom-koom', 'https://lwyykzcsmykkaoshijsn.supabase.co/storage/v1/object/public/photos/plats/zoom-koom.jpg', 'Vineke', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Bidon_de_Zoom_Koom.jpg')
) as v(slug, url, credit, lic, src)
where d.slug = v.slug and d.image_url is null;
