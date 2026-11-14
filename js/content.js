// Contenu nutritionnel de Mon Assiette.
// Base : recommandations générales de l'OMS et de la FAO (assiette équilibrée, moins de sel, de sucre et de gras,
// plus de légumes, de légumineuses et de céréales locales), adaptées aux plats d'Afrique de l'Ouest.
// Tout ce contenu doit être relu par une nutritionniste diplômée avant le lancement public.

export const SLIDES = [
  { img: '/assets/slide1', alt: 'Deux fillettes souriantes, joue contre joue', pos: 'center 25%', pose: 'joie', side: 'right',
    bubble: "Salut ! Moi c'est Kalou, ton assistant nutrition.",
    title: 'Ton assistant\nnutrition', text: 'Un bilan comme chez la nutritionniste, puis des repas pensés pour toi : ta santé, tes allergies, ton budget, nos produits.' },
  { img: '/assets/slide2', alt: 'Des mains partageant un grand plat de riz au gras', pos: '45% 30%', pose: 'clin', side: 'left',
    bubble: 'Je t’explique toujours le pourquoi !',
    title: 'Nos plats,\nen mieux', text: 'Riz gras, tô, sauce feuilles… Tu gardes tes plats. Kalou te dit pourquoi chacun est bon pour toi, et comment l’améliorer.' },
  { img: '/assets/slide3', alt: "Trois élèves en uniforme sur la route de l'école", pos: 'center 15%', pose: 'bravo', side: 'right',
    bubble: 'On avance ensemble, jour après jour.',
    title: 'Grandir fort,\napprendre mieux', text: "Défis de la semaine, série de jours, petits progrès qui comptent. Kalou te suit et ajuste ton plan." }
];

/* ---------- Questionnaire (la consultation) ---------- */
export const SEXES = [{ id: 'f', label: 'Femme' }, { id: 'm', label: 'Homme' }];
export const AGES = [{ id: '13-17', label: '13–17 ans' }, { id: '18-34', label: '18–34 ans' }, { id: '35-59', label: '35–59 ans' }, { id: '60+', label: '60 ans et +' }];
export const ACTIVITIES = [
  { id: 'faible', label: 'Plutôt assis·e', desc: 'Bureau, peu de marche' },
  { id: 'moyenne', label: 'Actif·ve', desc: 'Je marche, je bouge dans la journée' },
  { id: 'forte', label: 'Très actif·ve', desc: 'Travail physique, champ, sport' }
];
export const GOALS = [
  { id: 'energie', label: "Avoir plus d'énergie", desc: 'Tenir la journée sans coup de fatigue', icon: 'person-running' },
  { id: 'equilibre', label: 'Manger plus équilibré', desc: 'Varier, mieux composer mes repas', icon: 'pot-of-food' },
  { id: 'sante', label: 'Prendre soin de ma santé', desc: 'Diabète, tension, anémie…', icon: 'stethoscope' },
  { id: 'poids', label: 'Retrouver un poids de forme', desc: 'Sans régime strict, sans privation', icon: 'bullseye' }
];
export const CONDITIONS = [
  { id: 'diabete', label: 'Diabète', desc: 'ou sucre élevé dans le sang' },
  { id: 'tension', label: 'Tension élevée', desc: 'hypertension' },
  { id: 'anemie', label: 'Anémie', desc: 'manque de fer, fatigue, pâleur' },
  { id: 'cholesterol', label: 'Cholestérol', desc: 'gras élevé dans le sang' },
  { id: 'estomac', label: 'Estomac sensible', desc: 'brûlures, ulcère' }
];
export const PREGNANCY = [{ id: 'non', label: 'Non' }, { id: 'enceinte', label: 'Enceinte' }, { id: 'allaite', label: "J'allaite" }];
export const ALLERGENS = [
  { id: 'arachide', label: 'Arachide', icon: 'peanuts' },
  { id: 'lait', label: 'Lait', icon: 'glass-of-milk' },
  { id: 'oeuf', label: 'Œuf', icon: 'egg' },
  { id: 'poisson', label: 'Poisson', icon: 'fish' },
  { id: 'crustaces', label: 'Crevettes, crustacés', icon: 'shrimp' },
  { id: 'gluten', label: 'Blé, gluten', icon: 'bread' }
];
export const DIETS = [{ id: 'tout', label: 'Je mange de tout' }, { id: 'vegetarien', label: 'Végétarien (ni viande ni poisson)' }];
export const HABITS = [
  { id: 'breakfast', q: 'Tu prends un petit-déjeuner ?', opts: [['souvent', 'Presque tous les jours', 2], ['parfois', 'Parfois', 1], ['rarement', 'Rarement', 0]] },
  { id: 'veggies', q: 'Des légumes ou des feuilles ?', opts: [['chaque_jour', 'Chaque jour', 2], ['parfois', 'Quelques fois par semaine', 1], ['rarement', 'Rarement', 0]] },
  { id: 'fruits', q: 'Des fruits ?', opts: [['chaque_jour', 'Chaque jour', 2], ['parfois', 'Quelques fois par semaine', 1], ['rarement', 'Rarement', 0]] },
  { id: 'sugary', q: 'Des boissons sucrées (sucreries, jus en sachet) ?', opts: [['jamais', 'Presque jamais', 2], ['parfois', 'Quelques fois par semaine', 1], ['chaque_jour', 'Chaque jour', 0]] },
  { id: 'cube', q: 'Combien de cubes dans une marmite ?', opts: [['aucun', 'Aucun ou soumbala', 2], ['un', 'Un', 1], ['plusieurs', 'Deux ou plus', 0]] },
  { id: 'appetite', q: 'Ton appétit en ce moment ?', opts: [['bon', 'Bon, j’ai faim aux repas', 2], ['variable', 'Ça dépend des jours', 1], ['faible', 'Souvent pas faim', 0]] },
  { id: 'water', q: "Combien d'eau par jour ?", opts: [['plus_2', 'Plus de 2 litres', 2], ['1_2', '1 à 2 litres', 1], ['moins_1', 'Moins d’un litre', 0]] }
];
export const BUDGETS = [
  { id: 500, label: '500 F CFA', desc: 'par personne et par jour · essentiel', icon: 'money-bag', tier: 1 },
  { id: 1000, label: '1 000 F CFA', desc: 'par personne et par jour · équilibré', icon: 'money-bag', tier: 2 },
  { id: 2000, label: '2 000 F CFA', desc: 'par personne et par jour · confort', icon: 'money-bag', tier: 3 }
];

/* ---------- Catalogue des repas ----------
   tags : iron (fer), folate, protein, fiber, vitc, vita, calcium, lowgi (index glycémique bas), refined (céréale raffinée),
   energy, kid, lowfat, fat, salty, sweet, veg, fruit, soft (facile à digérer), meat, fish, raw
   cost : 1 = budget 500 F, 2 = 1 000 F, 3 = 2 000 F (par personne et par jour)                                         */
const M = (slot, id, name, portion, cost, al, tags, ing, icon) => ({ slot, id, name, portion, cost, al, tags, ing, icon });
export const MEALS = [
  // Matin
  M('matin', 'b_mil_arachide', 'Bouillie de mil enrichie', "1 bol · pâte d'arachide + lait, peu sucrée", 1, ['arachide', 'lait'], ['protein', 'energy', 'kid', 'calcium', 'soft'], ['Farine de mil', "Pâte d'arachide", 'Lait en poudre'], 'bowl-with-spoon'),
  M('matin', 'b_mil_nature', 'Bouillie de petit mil au citron', '1 bol · sans sucre ajouté', 1, [], ['lowgi', 'soft', 'kid', 'vitc'], ['Farine de petit mil', 'Citron'], 'bowl-with-spoon'),
  M('matin', 'b_mais_poisson', 'Bouillie de maïs au poisson séché', '1 bol · poisson séché en poudre', 1, ['poisson'], ['protein', 'iron', 'kid', 'calcium', 'soft', 'fish', 'salty'], ['Farine de maïs', 'Poisson séché'], 'bowl-with-spoon'),
  M('matin', 'haricot_gari', 'Haricot + gari + oignons', "1 petite assiette · filet d'huile", 1, [], ['protein', 'fiber', 'iron', 'lowgi', 'energy'], ['Haricot', 'Gari', 'Oignons'], 'bento-box'),
  M('matin', 'haricot_pain', 'Haricot + pain + oignons', '1 petite assiette', 1, ['gluten'], ['protein', 'fiber', 'iron', 'energy'], ['Haricot', 'Pain', 'Oignons'], 'bread'),
  M('matin', 'patate_oeuf', 'Patate douce bouillie + œuf', '2 morceaux + 1 œuf', 2, ['oeuf'], ['vita', 'fiber', 'protein', 'lowgi', 'soft'], ['Patate douce', 'Œufs'], 'roasted-sweet-potato'),
  M('matin', 'omelette_pain', 'Omelette aux légumes + pain', '1 œuf · tomate, oignon, feuilles', 2, ['oeuf', 'gluten'], ['protein', 'veg', 'energy'], ['Œufs', 'Pain', 'Tomates', 'Oignons'], 'egg'),
  M('matin', 'fonio_lait', 'Bouillie de fonio au lait', '1 bol · peu sucrée', 2, ['lait'], ['lowgi', 'calcium', 'soft', 'kid'], ['Fonio', 'Lait en poudre'], 'bowl-with-spoon'),
  M('matin', 'yaourt_fruit', 'Yaourt nature + fruit + arachides', '1 pot + 1 fruit + 1 poignée', 3, ['lait', 'arachide'], ['calcium', 'protein', 'vitc', 'fruit'], ['Yaourt nature', 'Fruits de saison', 'Arachides'], 'glass-of-milk'),
  M('matin', 'mais_bouilli', 'Maïs bouilli + arachides', '1 épi + 1 poignée', 1, ['arachide'], ['fiber', 'energy', 'protein'], ['Maïs frais', 'Arachides'], 'ear-of-corn'),
  // Collation
  M('collation', 'mangue', '1 mangue', 'Fruit de saison, en entier', 1, [], ['vitc', 'vita', 'fruit', 'sweet', 'kid'], ['Mangues'], 'mango'),
  M('collation', 'orange', '1 orange', 'En quartiers, avec la pulpe', 1, [], ['vitc', 'fruit', 'lowgi', 'kid'], ['Oranges'], 'tangerine'),
  M('collation', 'goyave', '1 goyave', 'Très riche en vitamine C', 1, [], ['vitc', 'fiber', 'fruit', 'lowgi'], ['Goyaves'], 'mango'),
  M('collation', 'banane', '1 banane', 'Énergie rapide', 1, [], ['energy', 'fruit', 'kid', 'soft'], ['Bananes'], 'banana'),
  M('collation', 'arachides', 'Arachides grillées', '1 petite poignée, sans sel', 1, ['arachide'], ['protein', 'energy', 'fat'], ['Arachides'], 'peanuts'),
  M('collation', 'bouye', 'Jus de pain de singe (bouye)', '1 verre, peu sucré', 1, ['lait'], ['vitc', 'calcium', 'fiber'], ['Pain de singe', 'Lait en poudre'], 'cup-with-straw'),
  M('collation', 'papaye', '1 tranche de papaye', 'Douce pour la digestion', 1, [], ['vitc', 'vita', 'fruit', 'soft', 'fiber'], ['Papaye'], 'mango'),
  M('collation', 'yaourt', '1 yaourt nature', 'Sans sucre ajouté', 2, ['lait'], ['calcium', 'protein', 'soft'], ['Yaourt nature'], 'glass-of-milk'),
  M('collation', 'crudites', 'Carotte ou concombre cru', 'Bien lavé', 1, [], ['veg', 'fiber', 'lowgi', 'raw'], ['Carottes', 'Concombre'], 'leafy-green'),
  // Midi
  M('midi', 'riz_feuilles_poisson', 'Riz sauce feuilles + poisson', '½ assiette sauce feuilles · ¼ riz · ¼ poisson', 2, ['poisson'], ['iron', 'folate', 'protein', 'veg', 'fish', 'refined'], ['Riz', 'Feuilles (oseille ou baobab)', 'Poisson', 'Tomates', 'Oignons'], 'curry-rice'),
  M('midi', 'to_baobab_poisson', 'Tô de mil, sauce baobab + poisson séché', '1 boule · sauce bien garnie en feuilles', 1, ['poisson'], ['iron', 'folate', 'calcium', 'protein', 'lowgi', 'fish', 'salty'], ['Farine de mil', 'Feuilles de baobab', 'Poisson séché', 'Gombo'], 'pot-of-food'),
  M('midi', 'benga_legumes', 'Haricot (benga) aux légumes', 'Gari en petite quantité', 1, [], ['protein', 'iron', 'fiber', 'lowgi', 'veg', 'energy'], ['Haricot', 'Gari', 'Tomates', 'Oignons', 'Feuilles'], 'bento-box'),
  M('midi', 'riz_gras_poulet', 'Riz gras aux légumes + poulet', '½ légumes · ¼ riz · ¼ poulet, peu d’huile', 3, [], ['protein', 'veg', 'meat', 'refined', 'fat', 'energy'], ['Riz', 'Poulet', 'Carottes, chou, aubergines', 'Tomates'], 'shallow-pan-of-food'),
  M('midi', 'attieke_poisson', 'Attiéké, poisson braisé + crudités', 'Tomate, oignon, concombre bien lavés', 2, ['poisson'], ['protein', 'fish', 'lowfat', 'veg', 'raw', 'refined'], ['Attiéké', 'Poisson', 'Tomates, concombre', 'Oignons'], 'fish'),
  M('midi', 'riz_arachide', 'Riz sauce arachide + feuilles', '¼ riz · sauce avec feuilles, sans huile ajoutée', 2, ['arachide'], ['protein', 'iron', 'energy', 'fat', 'refined'], ['Riz', "Pâte d'arachide", 'Feuilles', 'Tomates'], 'curry-rice'),
  M('midi', 'to_gombo_oeuf', 'Tô de maïs, sauce gombo + œuf', '1 boule · 1 œuf dur dans la sauce', 1, ['oeuf'], ['protein', 'fiber', 'lowfat', 'soft'], ['Farine de maïs', 'Gombo', 'Œufs', 'Soumbala'], 'pot-of-food'),
  M('midi', 'couscous_niebe', 'Couscous de mil, sauce légumes + haricot', '1 assiette', 1, [], ['protein', 'fiber', 'lowgi', 'veg', 'iron'], ['Couscous de mil', 'Haricot', 'Carottes, chou, aubergines'], 'pot-of-food'),
  M('midi', 'fonio_legumes_poisson', 'Fonio aux légumes + poisson', '1 assiette · légumes en abondance', 3, ['poisson'], ['lowgi', 'protein', 'veg', 'fish', 'iron', 'fiber'], ['Fonio', 'Poisson', 'Carottes, chou, aubergines'], 'shallow-pan-of-food'),
  M('midi', 'igname_viande', 'Ragoût d’igname, légumes + viande', '2 morceaux d’igname · viande maigre', 3, [], ['protein', 'meat', 'iron', 'energy', 'veg'], ['Igname', 'Viande de bœuf', 'Tomates', 'Oignons'], 'pot-of-food'),
  M('midi', 'riz_tomate_crevettes', 'Riz sauce tomate + crevettes séchées', '¼ riz · ½ légumes', 2, ['crustaces'], ['protein', 'calcium', 'refined', 'salty'], ['Riz', 'Crevettes séchées', 'Tomates', 'Oignons'], 'curry-rice'),
  M('midi', 'riz_legumes_niebe', 'Riz aux légumes + haricot', '½ légumes · ¼ riz · ¼ haricot', 2, [], ['protein', 'fiber', 'veg', 'iron', 'refined'], ['Riz', 'Haricot', 'Carottes, chou, aubergines'], 'shallow-pan-of-food'),
  // Dessert (après le déjeuner)
  M('dessert', 'salade_fruits', 'Salade de fruits de saison', '1 petit bol · sans sucre ajouté', 1, [], ['vitc', 'vita', 'fruit', 'fiber'], ['Fruits de saison', 'Citron'], 'mango'),
  M('dessert', 'degue', 'Dèguè (mil au lait caillé)', '1 petit bol · peu sucré', 1, ['lait'], ['calcium', 'protein', 'energy', 'soft', 'sweet'], ['Farine de mil', 'Lait caillé'], 'bowl-with-spoon'),
  M('dessert', 'papaye_citron', 'Papaye au citron', '1 tranche · un filet de citron', 1, [], ['vitc', 'vita', 'soft', 'fruit'], ['Papaye', 'Citron'], 'mango'),
  M('dessert', 'yaourt_mangue', 'Yaourt nature + mangue', '1 pot + quelques morceaux', 2, ['lait'], ['calcium', 'protein', 'vitc', 'fruit'], ['Yaourt nature', 'Fruits de saison'], 'glass-of-milk'),
  M('dessert', 'banane_arachide', 'Banane + pâte d’arachide', '1 banane + 1 cuillère', 1, ['arachide'], ['energy', 'protein', 'soft', 'fruit'], ['Bananes', "Pâte d'arachide"], 'banana'),
  M('dessert', 'orange_dessert', 'Une orange en quartiers', 'Fraîche, après le repas', 1, [], ['vitc', 'fruit', 'lowgi'], ['Oranges'], 'tangerine'),
  M('dessert', 'goyave_dessert', 'Goyave fraîche', '1 fruit, bien lavé', 1, [], ['vitc', 'fiber', 'fruit', 'lowgi'], ['Goyaves'], 'mango'),
  // Boisson bien-être (fin d'après-midi)
  M('bienetre', 'bissap', 'Bissap frais sans sucre', '1 grand verre · menthe ou citron', 1, [], ['drink', 'refresh', 'lowgi', 'herbal'], ['Fleurs de bissap', 'Citron'], 'cup-with-straw'),
  M('bienetre', 'gingembre', 'Gingembre-citron tiède', '1 tasse · très peu de miel', 1, [], ['drink', 'appetite', 'herbal'], ['Gingembre', 'Citron'], 'cup-with-straw'),
  M('bienetre', 'citronnelle', 'Infusion de citronnelle', '1 tasse le soir · sans sucre', 1, [], ['drink', 'calm', 'herbal', 'lowgi'], ['Citronnelle'], 'herb'),
  M('bienetre', 'kinkeliba', 'Kinkéliba', '1 tasse · boisson traditionnelle, sans sucre', 1, [], ['drink', 'digest', 'herbal', 'lowgi'], ['Kinkéliba'], 'herb'),
  M('bienetre', 'eau_citron', 'Grand verre d’eau citronnée', 'Fraîche, avec quelques feuilles de menthe', 1, [], ['drink', 'refresh', 'vitc', 'lowgi'], ['Citron'], 'droplet'),
  M('bienetre', 'bouye_eau', 'Bouye à l’eau, peu sucré', '1 verre', 1, [], ['drink', 'vitc', 'fiber', 'calcium'], ['Pain de singe'], 'cup-with-straw'),
  // Soir
  M('soir', 'to_gombo_soumbala', 'Tô de maïs, sauce gombo au soumbala', '1 boule · soumbala au lieu du cube', 1, [], ['fiber', 'lowfat', 'soft', 'veg'], ['Farine de maïs', 'Gombo', 'Soumbala'], 'pot-of-food'),
  M('soir', 'soupe_legumes_to', 'Soupe de légumes + tô de mil', '1 bol de soupe · ½ boule', 1, [], ['veg', 'fiber', 'lowfat', 'lowgi', 'soft', 'vita'], ['Farine de mil', 'Carottes, chou, aubergines', 'Tomates', 'Oignons'], 'pot-of-food'),
  M('soir', 'patate_feuilles', 'Patate douce + sauce feuilles', '2 morceaux · sauce feuilles', 1, [], ['vita', 'iron', 'folate', 'fiber', 'lowgi', 'veg'], ['Patate douce', 'Feuilles', 'Tomates'], 'roasted-sweet-potato'),
  M('soir', 'haricot_leger', 'Haricot léger aux légumes', '1 petite assiette', 1, [], ['protein', 'fiber', 'iron', 'lowgi', 'veg'], ['Haricot', 'Tomates', 'Oignons'], 'bento-box'),
  M('soir', 'spaghetti_oeuf', 'Spaghetti aux légumes + œuf', '1 assiette · beaucoup de légumes', 2, ['gluten', 'oeuf'], ['protein', 'veg', 'refined', 'energy'], ['Spaghetti', 'Œufs', 'Carottes, chou, aubergines'], 'shallow-pan-of-food'),
  M('soir', 'couscous_legumes', 'Couscous de mil + sauce légumes', '1 assiette', 1, [], ['lowgi', 'fiber', 'veg', 'lowfat'], ['Couscous de mil', 'Carottes, chou, aubergines', 'Tomates'], 'pot-of-food'),
  M('soir', 'soupe_poisson', 'Soupe de poisson aux légumes', '1 grand bol · un peu de tô ou d’attiéké', 2, ['poisson'], ['protein', 'fish', 'lowfat', 'veg', 'soft', 'calcium'], ['Poisson', 'Carottes, chou, aubergines', 'Tomates'], 'fish'),
  M('soir', 'bouillie_soir', 'Bouillie de mil au lait (légère)', '1 bol · facile à digérer', 1, ['lait'], ['soft', 'calcium', 'kid', 'lowfat'], ['Farine de mil', 'Lait en poudre'], 'bowl-with-spoon'),
  M('soir', 'salade_oeuf', 'Salade composée + œuf + avocat', 'Crudités bien lavées, citron', 3, ['oeuf'], ['veg', 'protein', 'fiber', 'raw', 'lowgi'], ['Salade, tomates, concombre', 'Œufs', 'Avocat', 'Citron'], 'green-salad'),
  M('soir', 'fonio_sauce_feuilles', 'Fonio sauce feuilles', '1 assiette', 2, [], ['lowgi', 'iron', 'folate', 'veg', 'fiber'], ['Fonio', 'Feuilles', 'Tomates'], 'herb')
];
export const SLOT_ORDER = ['matin', 'collation', 'midi', 'dessert', 'bienetre', 'soir'];
export const MAIN_SLOTS = ['matin', 'collation', 'midi', 'soir'];
export const SLOT_INFO = {
  matin: { label: 'Matin', time: '7:30', icon: 'sun' },
  collation: { label: 'Collation', time: '10:00', icon: 'tangerine' },
  midi: { label: 'Midi', time: '13:00', icon: 'alarm-clock' },
  dessert: { label: 'Dessert', time: '13:30', icon: 'party-popper' },
  bienetre: { label: 'Bien-être', time: '17:00', icon: 'cup-with-straw' },
  soir: { label: 'Soir', time: '19:30', icon: 'crescent-moon' }
};

// Pourquoi un plat est bon : une phrase par atout
export const TAG_REASON = {
  iron: 'riche en fer', folate: 'feuilles riches en folates', protein: 'bonne source de protéines', fiber: 'riche en fibres',
  vitc: 'vitamine C (aide à absorber le fer)', vita: 'vitamine A pour les yeux et les défenses', calcium: 'apporte du calcium',
  lowgi: 'fait monter le sucre lentement', energy: 'énergie qui dure',
  lowfat: 'peu gras', soft: 'facile à digérer', veg: 'plein de légumes', refresh: 'rafraîchit et hydrate', calm: 'aide à se détendre avant de dormir', digest: 'boisson traditionnelle pour la digestion', appetite: 'réveille les papilles'
};

/* ---------- Plats à améliorer ---------- */
export const DISHES = [
  { id: 'rizgras', name: 'Riz gras', short: 'Riz gras', icon: 'shallow-pan-of-food', base: 45, al: [], tips: [
    { t: 'Ajoute une grosse poignée de légumes', why: 'Chou, carotte, aubergine : des fibres et des vitamines sans gros budget.', pts: 15, focus: ['legumes', 'poids'] },
    { t: "Une cuillère d'huile en moins par personne", why: "Le goût reste, et c'est plus léger pour le cœur.", pts: 12, focus: ['poids', 'cholesterol'] },
    { t: 'Un cube sur deux remplacé par du soumbala', why: 'Moins de sel, plus de saveur locale.', pts: 10, focus: ['sel'] },
    { t: 'Ajoute du haricot ou un œuf', why: 'Pour tenir plus longtemps et bien grandir.', pts: 13, focus: ['proteines'] }
  ] },
  { id: 'to', name: 'Tô sauce gombo', short: 'Tô gombo', icon: 'pot-of-food', base: 55, al: [], tips: [
    { t: 'Ajoute des feuilles (oseille, baobab, moringa)', why: 'Du fer et des vitamines en plus dans la sauce.', pts: 12, focus: ['fer', 'fer_folates'] },
    { t: 'Ajoute du haricot, un œuf ou du poisson séché', why: 'Une protéine qui rend le repas complet.', pts: 13, focus: ['proteines'] },
    { t: 'Soumbala au lieu du cube', why: 'Moins de sel, même goût de chez nous.', pts: 10, focus: ['sel'] },
    { t: 'Tô de mil ou de maïs peu raffiné', why: 'Plus de fibres, une énergie qui dure plus longtemps.', pts: 8, focus: ['glycemie'] }
  ] },
  { id: 'arachide', name: 'Riz sauce arachide', short: 'Sauce arachide', icon: 'curry-rice', base: 50, al: ['arachide'], tips: [
    { t: 'Moitié assiette en légumes, un quart en riz', why: "La bonne règle de l'assiette équilibrée.", pts: 15, focus: ['glycemie', 'poids'] },
    { t: "Retire l'huile qui remonte sur la sauce", why: "L'arachide est déjà riche : pas besoin d'huile en plus.", pts: 10, focus: ['poids', 'cholesterol'] },
    { t: 'Ajoute des feuilles dans la sauce', why: 'Du fer et des vitamines en plus, pour presque rien.', pts: 10, focus: ['fer'] },
    { t: 'Un fruit en dessert plutôt que du sucré', why: 'La vitamine C aide aussi à absorber le fer.', pts: 8, focus: ['sucre'] }
  ] },
  { id: 'attieke', name: 'Attiéké poisson', short: 'Attiéké', icon: 'fish', base: 50, al: ['poisson'], tips: [
    { t: 'Poisson braisé plutôt que frit', why: "Moins d'huile, autant de goût.", pts: 14, focus: ['poids', 'cholesterol'] },
    { t: 'Ajoute des crudités bien lavées', why: 'Tomate, oignon, concombre : fraîcheur et vitamines.', pts: 12, focus: ['legumes'] },
    { t: 'Piment et citron plutôt que mayonnaise', why: 'Moins de gras, plus de saveur.', pts: 10, focus: ['poids'] },
    { t: "De l'eau plutôt qu'une boisson sucrée", why: 'Une bouteille de soda contient beaucoup de sucre.', pts: 9, focus: ['sucre', 'glycemie'] }
  ] },
  { id: 'benga', name: 'Haricot (benga)', short: 'Benga', icon: 'bento-box', base: 60, al: [], tips: [
    { t: 'Ajoute des légumes verts ou des feuilles', why: 'Le haricot et les feuilles se complètent bien.', pts: 12, focus: ['fer', 'legumes'] },
    { t: 'Un fruit riche en vitamine C au repas', why: 'Orange, goyave ou mangue aident à absorber le fer du haricot.', pts: 10, focus: ['fer', 'fer_folates'] },
    { t: "Un filet d'huile seulement", why: 'Assez pour le goût, pas plus.', pts: 8, focus: ['poids'] },
    { t: 'Gari en petite quantité', why: "Le haricot nourrit déjà bien : pas besoin d'une montagne de gari.", pts: 6, focus: ['glycemie'] }
  ] }
];

/* ---------- Défis de la semaine (liés aux priorités) ---------- */
export const MISSIONS = {
  sel: { title: '4 jours sans cube', desc: 'Remplace le cube par du soumbala ou des épices.', goal: 4, icon: 'salt' },
  legumes: { title: 'Des légumes 5 jours', desc: 'Feuilles, gombo, chou, carotte : au moins un repas par jour.', goal: 5, icon: 'leafy-green' },
  fruits: { title: 'Un fruit par jour, 5 jours', desc: 'Le fruit de saison, c’est le moins cher.', goal: 5, icon: 'tangerine' },
  sucre: { title: '5 jours sans boisson sucrée', desc: "De l'eau, du bissap ou du jus de bouye sans sucre ajouté.", goal: 5, icon: 'cup-with-straw' },
  hydratation: { title: "Objectif d'eau 4 jours", desc: 'Garde une bouteille près de toi.', goal: 4, icon: 'droplet' },
  petit_dej: { title: 'Petit-déjeuner 6 jours', desc: 'Même une bouillie rapide compte.', goal: 6, icon: 'bowl-with-spoon' },
  fer: { title: 'Fer 4 fois cette semaine', desc: 'Feuilles vertes, haricot ou poisson + un fruit.', goal: 4, icon: 'leafy-green' },
  fer_folates: { title: 'Feuilles vertes 5 jours', desc: 'Oseille, baobab, moringa : bon pour toi et bébé.', goal: 5, icon: 'herb' },
  glycemie: { title: 'Mil, fonio ou haricot 4 fois', desc: 'À la place du riz blanc.', goal: 4, icon: 'sheaf-of-rice' },
  poids: { title: "Moins d'huile 5 jours", desc: 'Une cuillère par personne suffit.', goal: 5, icon: 'bullseye' },
  proteines: { title: 'Une protéine à chaque repas, 5 jours', desc: 'Haricot, œuf, poisson, lait…', goal: 5, icon: 'flexed-biceps' },
  energie: { title: '3 repas par jour, 5 jours', desc: 'Ne saute pas de repas pour tenir la journée.', goal: 5, icon: 'person-running' },
  prise: { title: 'Collation chaque jour, 5 jours', desc: 'Arachides, banane, bouillie : des petits plus.', goal: 5, icon: 'banana' },
  calcium_proteines: { title: 'Lait ou poisson 5 jours', desc: 'Pour garder des os et des muscles solides.', goal: 5, icon: 'glass-of-milk' },
  securite: { title: 'Tout bien cuit 7 jours', desc: 'Œufs, viande et poisson bien cuits, crudités bien lavées.', goal: 7, icon: 'shield' },
  estomac: { title: 'Repas doux 5 jours', desc: 'Moins de piment et de friture, des repas réguliers.', goal: 5, icon: 'bowl-with-spoon' },
  cholesterol: { title: 'Pas de friture 5 jours', desc: 'Braisé, bouilli ou en sauce plutôt que frit.', goal: 5, icon: 'red-heart' },
  equilibre: { title: 'Assiette équilibrée 5 jours', desc: '½ légumes, ¼ céréales, ¼ protéines.', goal: 5, icon: 'bullseye' }
};

export const TIPS = [
  { t: 'Remplace un cube sur deux par du soumbala : le goût reste, le sel baisse.', for: ['sel'] },
  { t: "Les feuilles de moringa, de baobab ou d'oseille ajoutent du fer et des vitamines à ta sauce.", for: ['fer', 'fer_folates', 'legumes'] },
  { t: 'Un fruit riche en vitamine C (orange, goyave, mangue) pendant le repas aide ton corps à absorber le fer.', for: ['fer', 'fer_folates'] },
  { t: "Préfère l'eau aux boissons sucrées : ton corps et ton porte-monnaie te remercient.", for: ['sucre', 'glycemie', 'poids'] },
  { t: "Cuis les légumes juste ce qu'il faut : trop cuits, ils perdent une partie de leurs vitamines.", for: ['legumes'] },
  { t: 'Lave-toi les mains au savon avant de cuisiner et avant de manger.', for: ['securite', 'equilibre'] },
  { t: "La moitié de l'assiette en légumes, un quart en céréales, un quart en protéines : c'est la règle d'or.", for: ['poids', 'glycemie', 'equilibre'] },
  { t: 'Le haricot est une protéine pas chère : pense à lui plusieurs fois par semaine.', for: ['proteines', 'fer', 'equilibre'] },
  { t: "Thé et café pendant le repas gênent l'absorption du fer : garde-les à distance des repas.", for: ['fer', 'fer_folates'] },
  { t: 'Mange lentement et pose la cuillère entre deux bouchées : ton ventre a le temps de dire « assez ».', for: ['poids'] },
  { t: 'Le mil, le sorgho et le fonio font monter le sucre plus doucement que le riz blanc.', for: ['glycemie'] },
  { t: "Garde une bouteille d'eau près de toi : tu boiras sans y penser.", for: ['hydratation'] },
  { t: 'Des repas à heures régulières et moins de piment soulagent un estomac sensible.', for: ['estomac'] }
];

export function seasonFor(month) {
  if (month >= 9 && month <= 11) return ['Mil et sorgho', 'Maïs', 'Arachide', 'Haricot', 'Patate douce', 'Feuilles', 'Goyave', 'Orange'];
  if (month === 12 || month <= 2) return ['Tomate', 'Oignon', 'Chou', 'Carotte', 'Salade', 'Orange', 'Goyave', 'Pomme de terre'];
  if (month >= 3 && month <= 5) return ['Mangue', 'Tomate', 'Oignon', 'Gombo', 'Pastèque', 'Feuilles de baobab', 'Néré', 'Pain de singe'];
  return ['Mangue', 'Maïs frais', 'Gombo', 'Feuilles', 'Arachide fraîche', 'Aubergine', 'Concombre', 'Piment'];
}

export const CHAT_CHIPS = ['Pourquoi ce menu pour moi ?', 'Que manger le soir ?', 'Mes allergies', "Combien d'eau par jour ?", 'Bien manger sans trop dépenser', 'Je grignote le soir'];

/* ---------- Offres ---------- */
export const PLANS = [
  { id: 'semaine', name: 'Semaine', desc: 'Pour essayer à petit prix', price: '300 F', per: 'CFA / semaine', popular: false },
  { id: 'mois', name: 'Mois', desc: 'Plus de 20 % moins cher que la semaine', price: '1 000 F', per: 'CFA / mois', popular: true },
  { id: 'trimestre', name: '3 mois', desc: 'Le meilleur prix pour suivre un vrai programme', price: '2 500 F', per: 'CFA / 3 mois', popular: false }
];
export const PLAN_NAMES = { semaine: 'Plus Semaine', mois: 'Plus Mois', trimestre: 'Plus 3 mois' };
export const FEATURES = [
  ['Bilan nutritionnel complet', '✓', '✓'],
  ['Plan du jour personnalisé et expliqué', '✓', '✓'],
  ['Défi de la semaine et série de jours', '✓', '✓'],
  ['Améliorer un plat', '3 / sem.', 'Illimité'],
  ['Plan de 7 jours + courses de la semaine', '—', '✓'],
  ['Changer un repas du plan', '1 / jour', 'Illimité'],
  ['Questions à une nutritionniste', '—', '✓']
];
// Logos officiels : fichiers à déposer dans assets/pay/ (kit marchand de chaque opérateur ou de l'agrégateur de paiement).
// Tant qu'ils sont absents, l'app affiche une pastille aux couleurs de l'opérateur.
export const PAYMENTS = [
  { id: 'orange', label: 'Orange Money', logo: '/assets/pay/orange-money.png', color: '#FF7900', ink: '#000000', phone: true },
  { id: 'moov', label: 'Moov Money', logo: '/assets/pay/moov-money.png', color: '#0066B3', ink: '#ffffff', phone: true },
  { id: 'card', label: 'Carte', logo: null, icon: 'credit-card', color: '#F2F3F2', ink: '#141614', phone: false }
];

/* ---------- Comment préparer (étapes courtes) ---------- */
export const HOW = {
  b_mil_arachide: ['Délaye la farine de mil dans un peu d’eau froide.', 'Verse dans l’eau bouillante en remuant 10 minutes.', "Hors du feu, ajoute 1 cuillère de pâte d'arachide et 2 de lait. Sucre très peu."],
  b_mil_nature: ['Délaye la farine dans de l’eau froide.', 'Fais cuire 10 minutes en remuant.', 'Ajoute le jus d’un demi-citron. Pas de sucre.'],
  b_mais_poisson: ['Rince le poisson séché, enlève les arêtes et pile-le en poudre.', 'Cuis la bouillie de maïs 10 minutes.', 'Ajoute 1 cuillère de poudre de poisson à la fin.'],
  haricot_gari: ['Laisse tremper le haricot la veille (cuisson plus rapide).', 'Cuis-le 45 minutes avec un oignon.', 'Sers avec 2 cuillères de gari et un filet d’huile.'],
  haricot_pain: ['Cuis le haricot avec un oignon jusqu’à ce qu’il soit tendre.', 'Ajoute un filet d’huile et un peu de sel.', 'Sers avec un morceau de pain.'],
  patate_oeuf: ['Épluche et coupe la patate douce.', 'Fais bouillir 20 minutes avec l’œuf (10 minutes pour l’œuf).', 'Sers chaud, avec un peu de piment si tu veux.'],
  omelette_pain: ['Coupe tomate, oignon et quelques feuilles.', 'Bats l’œuf, mélange aux légumes.', 'Cuis dans une poêle avec très peu d’huile. Sers avec le pain.'],
  fonio_lait: ['Lave le fonio deux fois.', 'Cuis-le 10 minutes dans l’eau en remuant.', 'Ajoute 2 cuillères de lait, très peu de sucre.'],
  yaourt_fruit: ['Coupe le fruit en morceaux.', 'Mélange au yaourt nature.', 'Ajoute une poignée d’arachides grillées.'],
  mais_bouilli: ['Fais bouillir l’épi 15 à 20 minutes.', 'Sers avec une petite poignée d’arachides.'],
  mangue: ['Lave le fruit.', 'Mange-le entier, avec la peau bien lavée ou épluché.'],
  orange: ['Épluche et mange en quartiers : la pulpe garde les fibres.'],
  goyave: ['Lave bien la goyave.', 'Mange-la entière, peau comprise.'],
  banane: ['Une banane bien mûre, c’est tout.'],
  arachides: ['Grille les arachides à sec dans une poêle 5 minutes.', 'Pas de sel ajouté. Une petite poignée suffit.'],
  bouye: ['Délaye la poudre de pain de singe dans de l’eau.', 'Ajoute un peu de lait, très peu de sucre.', 'Filtre et sers frais.'],
  papaye: ['Lave, coupe une tranche, enlève les graines.'],
  yaourt: ['Un yaourt nature, sans sucre ajouté.'],
  crudites: ['Lave à l’eau propre (quelques gouttes d’eau de javel alimentaire si possible).', 'Épluche et coupe en bâtonnets.'],
  riz_feuilles_poisson: ['Lave et hache les feuilles, fais-les cuire 15 minutes.', 'Prépare la sauce : tomate, oignon, peu d’huile, ajoute les feuilles et le poisson.', 'Cuis le riz à part. Sers : moitié sauce, un quart riz.'],
  to_baobab_poisson: ['Rince le poisson séché pour enlever le sel.', 'Fais la sauce : feuilles de baobab, gombo, poisson, peu d’huile.', 'Prépare le tô de mil : farine versée en pluie dans l’eau bouillante, remue fort.'],
  benga_legumes: ['Cuis le haricot avec un oignon.', 'Ajoute tomate et feuilles hachées, laisse mijoter 10 minutes.', 'Sers avec un peu de gari.'],
  riz_gras_poulet: ['Fais revenir le poulet avec oignon et tomate dans 1 cuillère d’huile par personne.', 'Ajoute beaucoup de légumes et de l’eau.', 'Verse le riz et laisse cuire à couvert 20 minutes.'],
  attieke_poisson: ['Braise le poisson (pas de friture).', 'Coupe tomate, oignon, concombre bien lavés.', 'Réchauffe l’attiéké à la vapeur. Citron et piment pour le goût.'],
  riz_arachide: ['Délaye la pâte d’arachide dans de l’eau chaude.', 'Cuis avec tomate, oignon et feuilles, sans ajouter d’huile.', 'Sers avec un quart d’assiette de riz.'],
  to_gombo_oeuf: ['Fais cuire les œufs 10 minutes.', 'Prépare la sauce gombo avec du soumbala, sans cube.', 'Prépare le tô de maïs et sers avec un œuf dans la sauce.'],
  couscous_niebe: ['Cuis le haricot à l’avance.', 'Fais une sauce légumes (chou, carotte, aubergine) et ajoute le haricot.', 'Cuis le couscous de mil à la vapeur.'],
  fonio_legumes_poisson: ['Lave le fonio, cuis-le à la vapeur 15 minutes.', 'Fais sauter les légumes avec peu d’huile.', 'Ajoute le poisson braisé ou cuit dans la sauce.'],
  igname_viande: ['Fais revenir la viande coupée avec oignon et tomate.', 'Ajoute l’igname en morceaux, les légumes et de l’eau.', 'Laisse mijoter 30 minutes.'],
  riz_tomate_crevettes: ['Rince les crevettes séchées.', 'Fais une sauce tomate-oignon avec peu d’huile et les crevettes.', 'Sers avec un quart d’assiette de riz et des légumes.'],
  riz_legumes_niebe: ['Cuis le haricot à part.', 'Fais revenir les légumes avec peu d’huile, ajoute le riz et l’eau.', 'Mélange le haricot avant de servir.'],
  to_gombo_soumbala: ['Coupe le gombo en rondelles.', 'Cuis-le avec un peu de soumbala, sans cube, 15 minutes.', 'Sers avec le tô de maïs.'],
  soupe_legumes_to: ['Coupe les légumes en morceaux.', 'Fais-les bouillir 20 minutes avec tomate et oignon.', 'Sers avec une demi-boule de tô de mil.'],
  patate_feuilles: ['Fais bouillir la patate douce 20 minutes.', 'Prépare une sauce feuilles avec tomate et peu d’huile.', 'Sers ensemble.'],
  haricot_leger: ['Cuis le haricot avec oignon et tomate.', 'Pas trop d’huile : une cuillère suffit.'],
  spaghetti_oeuf: ['Cuis les spaghettis.', 'Fais sauter beaucoup de légumes avec peu d’huile.', 'Mélange et ajoute un œuf dur ou brouillé.'],
  couscous_legumes: ['Cuis le couscous de mil à la vapeur.', 'Prépare une sauce légumes et tomate.'],
  soupe_poisson: ['Fais bouillir le poisson avec tomate, oignon et légumes 20 minutes.', 'Sers avec un peu de tô ou d’attiéké.'],
  salade_fruits: ['Lave et coupe 2 ou 3 fruits de saison.', 'Ajoute un filet de citron, pas de sucre.'],
  degue: ['Mélange le dèguè (granulés de mil cuits) au lait caillé.', 'Sucre très peu, sers bien frais.'],
  papaye_citron: ['Coupe une tranche, enlève les graines.', 'Arrose d’un filet de citron.'],
  yaourt_mangue: ['Coupe la mangue en dés.', 'Mélange au yaourt nature.'],
  banane_arachide: ['Coupe la banane en rondelles.', 'Ajoute une cuillère de pâte d’arachide.'],
  orange_dessert: ['Épluche et sers en quartiers bien frais.'],
  goyave_dessert: ['Lave bien et mange entière.'],
  bissap: ['Fais bouillir les fleurs de bissap 10 minutes.', 'Filtre, ajoute menthe ou citron, laisse refroidir.', 'Pas de sucre : le goût acidulé suffit.'],
  gingembre: ['Râpe un petit morceau de gingembre dans de l’eau chaude.', 'Laisse infuser 5 minutes, ajoute le jus d’un demi-citron.'],
  citronnelle: ['Fais infuser quelques feuilles de citronnelle 5 minutes dans l’eau bouillante.', 'Bois tiède, 1 heure avant de dormir.'],
  kinkeliba: ['Fais infuser une poignée de feuilles de kinkéliba 10 minutes.', 'Bois tiède, sans sucre.'],
  eau_citron: ['Un grand verre d’eau propre, le jus d’un demi-citron, quelques feuilles de menthe.'],
  bouye_eau: ['Délaye 2 cuillères de poudre de pain de singe dans un verre d’eau.', 'Filtre, très peu de sucre.'],
  bouillie_soir: ['Prépare une bouillie légère de mil.', 'Ajoute un peu de lait.'],
  salade_oeuf: ['Lave très bien salade, tomate, concombre.', 'Ajoute un œuf dur et de l’avocat.', 'Assaisonne au citron.'],
  fonio_sauce_feuilles: ['Cuis le fonio à la vapeur.', 'Prépare une sauce feuilles avec tomate et peu d’huile.']
};

// Ce qu'on peut avoir dans sa cuisine (pour « J'ai ces ingrédients »)
export const PANTRY = [
  'Riz', 'Farine de mil', 'Farine de maïs', 'Fonio', 'Couscous de mil', 'Gari', 'Attiéké', 'Pain', 'Spaghetti',
  'Haricot', "Pâte d'arachide", 'Arachides', 'Œufs', 'Poisson', 'Poisson séché', 'Poulet', 'Viande de bœuf', 'Lait en poudre',
  'Lait caillé', 'Fleurs de bissap', 'Gingembre', 'Citron', 'Citronnelle', 'Kinkéliba',
  'Feuilles', 'Gombo', 'Tomates', 'Oignons', 'Carottes, chou, aubergines', 'Patate douce', 'Igname', 'Soumbala', 'Fruits de saison'
];

/* ---------- Le thème du jour : chaque jour a sa raison de manger ---------- */
// 0 = dimanche … 6 = samedi
export const DAY_THEMES = [
  { title: 'Dimanche douceur', why: 'On ralentit : des plats doux et faciles à digérer pour recharger avant la semaine.', w: { soft: 2, veg: 1 }, icon: 'bowl-with-spoon' },
  { title: 'Lundi énergie', why: 'La semaine démarre : des céréales locales et des protéines pour tenir jusqu’au soir.', w: { energy: 2, protein: 1 }, icon: 'person-running' },
  { title: 'Mardi fer', why: 'Journée feuilles vertes et haricot : le fer chasse la fatigue de début de semaine.', w: { iron: 2, folate: 1, vitc: 1 }, icon: 'leafy-green' },
  { title: 'Mercredi légumes', why: 'Mi-semaine : on fait le plein de légumes et de fibres pour la digestion.', w: { veg: 2, fiber: 2 }, icon: 'green-salad' },
  { title: 'Jeudi protéines', why: 'Muscles et concentration : œuf, poisson, haricot ou lait à l’honneur.', w: { protein: 2, calcium: 1 }, icon: 'flexed-biceps' },
  { title: 'Vendredi léger', why: 'Fin de semaine chargée : des plats légers et peu gras pour garder la forme.', w: { lowfat: 2, veg: 1 }, icon: 'herb' },
  { title: 'Samedi plaisir', why: 'Ton plat préféré, en version équilibrée : se faire plaisir fait aussi partie de bien manger.', w: { energy: 1, protein: 1 }, icon: 'party-popper' }
];

// Pourquoi CE moment de la journée
export const SLOT_WHY = {
  matin: 'Ton corps sort de la nuit sans rien : ce repas relance ton énergie et ta concentration jusqu’à midi.',
  collation: 'Vers 10 h, l’énergie du matin baisse : une petite prise évite le coup de fatigue et les grignotages.',
  midi: 'C’est le moment où ton corps a le plus besoin de carburant : le repas principal de ta journée.',
  dessert: 'Un dessert léger termine le repas sur une note de plaisir et apporte des vitamines. Le plaisir donne aussi envie de passer à table.',
  bienetre: 'En fin d’après-midi, une boisson bien-être t’hydrate, te détend et prépare un dîner pris avec appétit.',
  soir: 'Un repas plus léger, 2 heures avant de dormir : ton corps récupère sans digestion lourde.'
};

export const APPETITE_TIPS = [
  'Petites portions, mais plus souvent : 4 à 5 prises par jour plutôt que 2 gros repas.',
  'Une marche de 10 minutes avant de manger ouvre l’appétit.',
  'Bois plutôt entre les repas qu’au milieu : l’eau remplit l’estomac.',
  'Les plats parfumés (gingembre, citron, soumbala, piment doux) donnent envie.',
  'Mange à heures fixes : ton corps apprend à avoir faim au bon moment.',
  'Si un repas ne passe pas, une bouillie enrichie ou une banane valent mieux que rien.'
];

/* ---------- Ce que ton corps reçoit (roue nutritionnelle du jour) ---------- */
export const NUTRIENTS = [
  { id: 'energy', label: 'Énergie', icon: 'person-running', tags: ['energy'], body: 'tenir la journée sans coup de fatigue' },
  { id: 'protein', label: 'Protéines', icon: 'flexed-biceps', tags: ['protein'], body: 'des muscles solides et une bonne récupération' },
  { id: 'iron', label: 'Fer', icon: 'leafy-green', tags: ['iron', 'folate'], body: 'un sang riche et moins de fatigue' },
  { id: 'fiber', label: 'Fibres', icon: 'sheaf-of-rice', tags: ['fiber'], body: 'une bonne digestion et un ventre rassasié' },
  { id: 'vitamins', label: 'Vitamines', icon: 'tangerine', tags: ['vitc', 'vita', 'fruit'], body: 'des défenses fortes et une belle peau' },
  { id: 'calcium', label: 'Calcium', icon: 'glass-of-milk', tags: ['calcium'], body: 'des os et des dents solides' },
  { id: 'veg', label: 'Légumes', icon: 'green-salad', tags: ['veg'], body: 'minéraux et protection du cœur' }
];
// Bénéfice concret de chaque atout, pour « Ce que ce repas t'apporte »
export const TAG_BENEFIT = {
  energy: 'de l’énergie pour les prochaines heures', protein: 'de quoi construire et réparer tes muscles',
  iron: 'du fer contre la fatigue', folate: 'des folates pour un sang en bonne santé', fiber: 'des fibres pour bien digérer',
  vitc: 'de la vitamine C pour tes défenses', vita: 'de la vitamine A pour tes yeux', calcium: 'du calcium pour tes os',
  veg: 'des minéraux et des antioxydants', refresh: 'de l’eau pour ton corps, avec du goût', calm: 'un moment de calme pour bien dormir', appetite: 'un coup de fouet pour l’appétit', digest: 'un geste doux pour la digestion', lowgi: 'un sucre qui monte doucement, sans coup de barre', soft: 'un repas qui se digère facilement'
};
