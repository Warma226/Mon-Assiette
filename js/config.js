// Clé publique Supabase (publishable) : faite pour être dans le navigateur.
// La sécurité des données repose sur les règles RLS de la base, pas sur le secret de cette clé.
export const CONFIG = {
  supabaseUrl: 'https://btzvpmearbdgqsozkzib.supabase.co',
  supabaseKey: 'sb_publishable_xj2JvOrjr_u-oAXu8igK7w_0oC92tKJ',
  trialHours: 72,
  // Pages de paiement Chariow (une par formule). Laisser null tant que le produit n'est pas publié.
  chariow: {
    semaine: 'https://otbbljjy.mychariow.shop/prd_oirgyxlr/checkout',
    mois: null,
    trimestre: null,
    annee: null
  },
  freeImprovesPerWeek: 3,
  reminders: { matin: '07:30', collation: '10:00', midi: '13:00', bienetre: '17:00', soir: '19:30' }
};
