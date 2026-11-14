// Contenu de l'application : conseils, plats, menus, réponses de Kalou.
// Tous les conseils sont généraux et doivent être relus par une nutritionniste avant le lancement public.

export const GOALS = [
  { id: 'energie', label: "Plus d'énergie", desc: "Tenir la journée au travail ou à l'école", icon: 'bolt' },
  { id: 'famille', label: 'Bien nourrir ma famille', desc: 'Des repas équilibrés pour tous', icon: 'family' },
  { id: 'grossesse', label: 'Grossesse ou allaitement', desc: 'Fer, protéines, bonnes portions', icon: 'heart' },
  { id: 'sante', label: 'Diabète ou tension', desc: 'Moins de sucre et de sel, en douceur', icon: 'pulse' },
  { id: 'poids', label: 'Garder un poids sain', desc: 'Des portions justes, sans régime strict', icon: 'scale' }
];

export const HOUSEHOLDS = [
  { id: '1', label: 'Moi seul·e', desc: '1 personne', icon: 'user' },
  { id: '2-3', label: '2 à 3 personnes', desc: 'Couple, colocation…', icon: 'users' },
  { id: '4-6', label: '4 à 6 personnes', desc: 'Famille', icon: 'family' },
  { id: '7+', label: '7 personnes et plus', desc: 'Grande famille, cour commune', icon: 'home' }
];

export const BUDGETS = [
  { id: 500, label: '500 F CFA', desc: 'par personne et par jour · essentiel', icon: 'wallet' },
  { id: 1000, label: '1 000 F CFA', desc: 'par personne et par jour · équilibré', icon: 'wallet' },
  { id: 2000, label: '2 000 F CFA', desc: 'par personne et par jour · confort', icon: 'wallet' }
];

export const LANGS = ['Français', 'Mooré', 'Dioula', 'Fulfuldé'];

export const SLIDES = [
  {
    img: '/assets/slide1', alt: 'Deux fillettes souriantes, joue contre joue', pos: 'center 25%', pose: 'joie', side: 'right',
    bubble: "Salut ! Moi c'est Kalou, ton coach repas.",
    title: "Bien nourrir\nceux qu'on aime",
    text: 'Des conseils simples pour toute la famille : quoi manger, quand et en quelle quantité, avec les produits de chez nous.'
  },
  {
    img: '/assets/slide2', alt: 'Des mains partageant un grand plat de riz au gras', pos: '45% 30%', pose: 'clin', side: 'left',
    bubble: "Garde ton riz gras. On va juste l'équilibrer !",
    title: 'Nos plats,\nen mieux',
    text: 'Riz gras, tô, sauce feuilles… Garde tes plats préférés : on te montre comment les rendre plus équilibrés, sans dépasser ton budget.'
  },
  {
    img: '/assets/slide3', alt: "Trois élèves en uniforme sur la route de l'école", pos: 'center 15%', pose: 'bravo', side: 'right',
    bubble: 'Prêt ? On commence ensemble !',
    title: 'Grandir fort,\napprendre mieux',
    text: "Un bon petit-déjeuner, c'est plus d'énergie à l'école comme au travail. Suis tes repas et reçois un rappel au bon moment."
  }
];

export const QUESTIONS = [
  { title: "Comment tu t'appelles ?", hint: 'On fait connaissance en 4 petites questions.' },
  { title: 'Quel est ton objectif principal ?', hint: 'Tu pourras le changer quand tu veux.' },
  { title: 'Tu cuisines pour combien de personnes ?', hint: 'Pour adapter les quantités et la liste du marché.' },
  { title: 'Quel budget repas par jour ?', hint: 'Par personne. Kalou propose des menus qui tiennent dedans.' }
];

export const TIPS = [
  'Remplace un cube sur deux par du soumbala : le goût reste, le sel baisse.',
  "Les feuilles de moringa, de baobab ou d'oseille ajoutent du fer et des vitamines à ta sauce.",
  'Un fruit riche en vitamine C (orange, goyave, mangue) pendant le repas aide ton corps à mieux absorber le fer.',
  "Préfère l'eau aux boissons sucrées : ton corps et ton porte-monnaie te remercient.",
  "Pour les petits, enrichis la bouillie avec de la pâte d'arachide, du lait ou du poisson séché en poudre.",
  "Cuis les légumes juste ce qu'il faut : trop cuits, ils perdent une partie de leurs vitamines.",
  'Lave-toi les mains au savon avant de cuisiner et avant de manger.',
  "La moitié de l'assiette en légumes, un quart en céréales, un quart en protéines : c'est la règle d'or.",
  "Le haricot (niébé) est une protéine pas chère : pense à lui plusieurs fois par semaine."
];

// Menus de la semaine : 7 jours × 4 moments. Clés stables pour l'historique.
// [moment, heure, nom, détail, icône]
export const WEEK_PLAN = [
  [['Matin', '7:30', 'Bouillie de mil enrichie', "1 bol · pâte d'arachide + lait", 'green'], ['Collation', '10:00', '1 mangue', 'Fruit de saison', 'mango'], ['Midi', '13:00', 'Riz sauce feuilles + poisson', '½ légumes · ¼ riz · ¼ poisson', 'orange'], ['Soir', '19:30', 'Tô de maïs, sauce gombo', '1 boule · soumbala au lieu du cube', 'blue']],
  [['Matin', '7:30', 'Bouillie de petit mil + lait', '1 bol', 'green'], ['Collation', '10:00', '1 orange', 'Vitamine C', 'mango'], ['Midi', '13:00', 'Tô de mil, sauce baobab + poisson', '1 boule · feuilles en plus', 'orange'], ['Soir', '19:30', 'Spaghetti aux légumes et œuf', '1 assiette', 'blue']],
  [['Matin', '7:30', 'Haricot + pain + oignons', '1 petite assiette', 'green'], ['Collation', '10:00', '1 goyave', 'Fruit de saison', 'mango'], ['Midi', '13:00', 'Riz gras aux légumes + poulet', '½ légumes · ¼ riz · ¼ poulet', 'orange'], ['Soir', '19:30', 'Soupe de légumes + tô', '1 bol de soupe · 1 boule', 'blue']],
  [['Matin', '7:30', 'Bouillie de maïs + arachide', '1 bol', 'green'], ['Collation', '10:00', '1 banane', 'Fruit', 'mango'], ['Midi', '13:00', 'Haricot (benga) + légumes', "Niébé, gari, filet d'huile", 'orange'], ['Soir', '19:30', 'Riz sauce arachide + feuilles', '¼ riz · ½ légumes', 'blue']],
  [['Matin', '7:30', 'Bouillie de riz au lait', '1 bol · peu de sucre', 'green'], ['Collation', '10:00', '1 tranche de papaye', 'Fruit', 'mango'], ['Midi', '13:00', 'Attiéké, poisson braisé + crudités', 'Tomate, oignon, concombre', 'orange'], ['Soir', '19:30', 'Tô de mil, sauce feuilles', 'Poisson séché dans la sauce', 'blue']],
  [['Matin', '7:30', 'Bouillie de mil + lait', '1 bol', 'green'], ['Collation', '10:00', 'Arachides grillées', '1 petite poignée', 'mango'], ['Midi', '13:00', 'Riz sauce tomate + œuf + légumes', '½ légumes · ¼ riz', 'orange'], ['Soir', '19:30', 'Patate douce + sauce feuilles', '2 morceaux', 'blue']],
  [['Matin', '7:30', 'Pain + œuf + oignons', '1 œuf · thé peu sucré', 'green'], ['Collation', '10:00', '1 mangue', 'Fruit de saison', 'mango'], ['Midi', '13:00', 'Riz gras au poisson + légumes', 'Moins d’huile', 'orange'], ['Soir', '19:30', 'Couscous de mil + sauce légumes', '1 assiette', 'blue']]
];
export const MEAL_KEYS = ['matin', 'collation', 'midi', 'soir'];

export const DISHES = [
  { id: 'rizgras', name: 'Riz gras', short: 'Riz gras', color: 'orange', base: 45, tips: [
    { t: 'Ajoute une grosse poignée de légumes', why: 'Chou, carotte, aubergine : des fibres et des vitamines sans gros budget.', pts: 15 },
    { t: "Une cuillère d'huile en moins par personne", why: "Le goût reste, et c'est plus léger pour le cœur.", pts: 12 },
    { t: 'Un cube sur deux remplacé par du soumbala', why: 'Moins de sel, plus de saveur locale.', pts: 10 },
    { t: 'Ajoute une protéine : haricot, poisson ou œuf', why: 'Pour tenir plus longtemps et bien grandir.', pts: 13 }
  ] },
  { id: 'to', name: 'Tô sauce gombo', short: 'Tô gombo', color: 'green', base: 55, tips: [
    { t: 'Ajoute des feuilles (oseille, baobab, moringa)', why: 'Du fer et des vitamines en plus dans la sauce.', pts: 12 },
    { t: 'Du poisson séché ou un œuf dans la sauce', why: 'Une protéine qui rend le repas complet.', pts: 13 },
    { t: 'Soumbala au lieu du cube', why: 'Moins de sel, même goût de chez nous.', pts: 10 },
    { t: 'Tô de mil ou de maïs peu raffiné', why: 'Plus de fibres, une énergie qui dure plus longtemps.', pts: 8 }
  ] },
  { id: 'arachide', name: 'Riz sauce arachide', short: 'Sauce arachide', color: 'yellow', base: 50, tips: [
    { t: 'Moitié assiette en légumes, un quart en riz', why: "La bonne règle de l'assiette équilibrée.", pts: 15 },
    { t: "Retire l'huile qui remonte sur la sauce", why: "L'arachide est déjà riche : pas besoin d'huile en plus.", pts: 10 },
    { t: 'Ajoute des feuilles dans la sauce', why: 'Fer et vitamines pour toute la famille.', pts: 10 },
    { t: 'Un fruit en dessert plutôt que du sucré', why: 'La vitamine C aide aussi à absorber le fer.', pts: 8 }
  ] },
  { id: 'attieke', name: 'Attiéké poisson', short: 'Attiéké', color: 'blue', base: 50, tips: [
    { t: 'Poisson braisé plutôt que frit', why: "Moins d'huile, autant de goût.", pts: 14 },
    { t: 'Ajoute des crudités (tomate, oignon, concombre)', why: 'Bien lavées, elles apportent fraîcheur et vitamines.', pts: 12 },
    { t: 'Piment et citron plutôt que mayonnaise', why: 'Moins de gras, plus de saveur.', pts: 10 },
    { t: "De l'eau plutôt qu'une boisson sucrée", why: 'Une bouteille de soda contient beaucoup de sucre.', pts: 9 }
  ] },
  { id: 'benga', name: 'Haricot (benga)', short: 'Benga', color: 'red', base: 60, tips: [
    { t: 'Ajoute des légumes verts ou des feuilles', why: 'Le haricot et les feuilles se complètent bien.', pts: 12 },
    { t: 'Un fruit riche en vitamine C au repas', why: 'Orange, goyave ou mangue aident à absorber le fer du haricot.', pts: 10 },
    { t: "Un filet d'huile seulement", why: 'Assez pour le goût, pas plus.', pts: 8 },
    { t: 'Gari en petite quantité', why: "Le haricot nourrit déjà bien : pas besoin d'une montagne de gari.", pts: 6 }
  ] }
];

export const MARKET = {
  500: {
    menu: [['Matin', "Bouillie de mil + pâte d'arachide"], ['Collation', 'Fruit de saison'], ['Midi', 'Tô de mil, sauce feuilles + soumbala'], ['Soir', 'Haricot (benga) + oignons']],
    items: [['Farine de mil', '1 kg'], ['Feuilles (oseille ou baobab)', '2 bottes'], ['Soumbala', '1 boule'], ['Niébé (haricot)', '1 kg'], ["Pâte d'arachide", '1 petit pot'], ['Oignons', '4'], ['Gombo séché', '1 sachet'], ['Sel iodé', '1 sachet']]
  },
  1000: {
    menu: [['Matin', 'Bouillie de mil enrichie au lait'], ['Collation', 'Mangue ou orange'], ['Midi', 'Riz sauce feuilles + poisson'], ['Soir', 'Tô de maïs, sauce gombo']],
    items: [['Farine de mil', '1 kg'], ['Riz', '1 kg'], ['Poisson (frais ou séché)', '2 morceaux'], ['Feuilles', '2 bottes'], ['Gombo', '1 tas'], ['Tomates', '1 tas'], ['Lait en poudre', '1 sachet'], ['Fruits de saison', '6']]
  },
  2000: {
    menu: [['Matin', 'Bouillie + lait + arachide, pain'], ['Collation', 'Fruit + yaourt nature'], ['Midi', 'Riz gras aux légumes + poulet'], ['Soir', 'Attiéké, poisson braisé + crudités']],
    items: [['Lait', '1 L'], ['Riz', '1 kg'], ['Poulet', '1'], ['Carottes, chou, aubergines', '1 tas chacun'], ['Attiéké', '2 boules'], ['Poisson', '2'], ['Tomates, concombre', '1 tas'], ['Fruits de saison', '6']]
  }
};

// Produits de saison au Burkina, par mois (approximatif, à adapter selon la région)
export function seasonFor(month) {
  if (month >= 9 && month <= 11) return ['Mil et sorgho', 'Maïs', 'Arachide', 'Niébé', 'Patate douce', 'Feuilles', 'Goyave', 'Orange'];
  if (month === 12 || month <= 2) return ['Tomate', 'Oignon', 'Chou', 'Carotte', 'Salade', 'Orange', 'Goyave', 'Pomme de terre'];
  if (month >= 3 && month <= 5) return ['Mangue', 'Tomate', 'Oignon', 'Gombo', 'Pastèque', 'Feuilles de baobab', 'Néré', 'Pain de singe'];
  return ['Mangue', 'Maïs frais', 'Gombo', 'Feuilles', 'Arachide fraîche', 'Aubergine', 'Concombre', 'Piment'];
}

export const CHAT_RULES = [
  [['soir', 'dîner', 'diner', 'nuit'], "Le soir, mange plus léger qu'à midi : une soupe de légumes, du tô avec une sauce feuilles, ou du haricot. Et essaie de dîner au moins 2 heures avant de dormir."],
  [['enfant', 'bébé', 'bebe', 'petit', 'refuse'], "Pour les petits : une bouillie enrichie (pâte d'arachide, lait ou poisson séché en poudre) et des légumes bien écrasés dans la sauce.\nPropose souvent, sans forcer : il faut parfois plusieurs essais pour qu'un enfant accepte un nouvel aliment."],
  [['diab', 'sucre', 'glyc'], "Avec le diabète, tu peux garder le riz, mais en petite part : un quart de l'assiette, avec beaucoup de légumes et une protéine. Évite les boissons sucrées.\nSuis toujours les conseils de ton médecin et fais tes contrôles."],
  [['eau', 'boire', 'soif'], 'En général, vise 1,5 à 2 litres par jour, soit environ 8 verres. Un peu plus quand il fait chaud ou si tu travailles dehors.'],
  [['enceinte', 'grossesse', 'allait'], "Pendant la grossesse, mise sur les feuilles vertes, le haricot, le poisson et les œufs pour le fer et les protéines.\nPrends les compléments donnés au centre de santé et va à toutes tes consultations prénatales."],
  [['tension', 'sel', 'hypert'], "Pour la tension : moins de cubes et de sel, plus de soumbala, de légumes et de fruits. Et un peu de marche chaque jour.\nSi tu as un traitement, continue-le comme ton médecin l'a dit."],
  [['cher', 'budget', 'prix', 'argent', 'dépens', 'depens'], "Bien manger n'est pas forcément cher : haricot, feuilles, mil et fruits de saison sont nourrissants et abordables.\nVa dans l'onglet Marché : je te propose un menu selon ton budget."],
  [['poids', 'maigrir', 'grossir', 'mincir'], "Pour un poids sain : la moitié de l'assiette en légumes, un quart en céréales, un quart en protéines. Moins d'huile et de boissons sucrées, et du mouvement chaque jour."],
  [['fatigu', 'énergie', 'energie'], "Pour plus d'énergie : un vrai petit-déjeuner (bouillie enrichie, haricot), de l'eau toute la journée, et des feuilles vertes pour le fer.\nSi la fatigue dure, parle-en à un agent de santé."],
  [['petit-déj', 'petit dej', 'matin'], "Le matin, une bouillie de mil enrichie (arachide, lait) ou du haricot avec du pain, c'est parfait pour tenir jusqu'à midi."],
  [['merci'], 'Avec plaisir ! Je suis là quand tu veux.'],
  [['bonjour', 'salut', 'bonsoir', 'coucou'], "Bonjour {name} ! Pose-moi ta question sur les repas, je t'écoute."]
];
export const CHAT_FALLBACK = "Bonne question ! Je n'ai pas encore de réponse sûre à ça. Avec Plus, tu peux la poser directement à une nutritionniste.";
export const CHAT_CHIPS = ['Que manger le soir ?', 'Mon enfant refuse les légumes', 'Diabète : je peux manger du riz ?', "Combien d'eau par jour ?", 'Bien manger sans trop dépenser'];

export const PLANS = [
  { id: 'semaine', name: 'Semaine', desc: 'Pour essayer à petit prix', price: '300 F', per: 'CFA / semaine', popular: false },
  { id: 'mois', name: 'Mois', desc: 'Plus de 20 % moins cher que la semaine', price: '1 000 F', per: 'CFA / mois', popular: true },
  { id: 'famille', name: 'Famille', desc: "Jusqu'à 5 profils, enfants compris", price: '2 500 F', per: 'CFA / mois', popular: false }
];
export const PLAN_NAMES = { semaine: 'Plus Semaine', mois: 'Plus Mois', famille: 'Plus Famille' };

export const FEATURES = [
  ['Plan repas du jour', '✓', '✓'],
  ['Astuces de Kalou (lecture audio)', '✓', '✓'],
  ['Améliorer un plat', '3 / sem.', 'Illimité'],
  ['Menus de 7 jours selon ton budget', '—', '✓'],
  ['Programmes grossesse, bébé, diabète, tension', '—', '✓'],
  ['Questions à une nutritionniste', '—', '✓']
];
