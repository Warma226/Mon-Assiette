// Moteur nutritionnel : bilan du profil, priorités, plan de repas personnalisé et expliqué.
// Les règles suivent les recommandations générales (OMS, FAO) et ne remplacent pas un avis médical.

import { MEALS, SLOT_ORDER, TAG_REASON, HABITS, ALLERGENS, BUDGETS, MISSIONS, TIPS, DAY_THEMES, DETAILS, COUNTRIES } from './content.js';
import { now } from './time.js';

export const PRIORITIES = {
  fer_folates: { title: 'Fer et folates', icon: 'herb', why: 'Enceinte, ton corps fabrique plus de sang et bébé construit son système nerveux. Les feuilles vertes, le haricot et le poisson t’aident.', w: { iron: 3, folate: 3, vitc: 1, protein: 1 } },
  securite: { title: 'Aliments sûrs', icon: 'shield', why: 'Enceinte, une intoxication est plus risquée : œufs, viande et poisson bien cuits, crudités et fruits bien lavés.', w: { raw: -3 } },
  proteines: { title: 'Assez de protéines', icon: 'flexed-biceps', why: 'Les protéines construisent les muscles et réparent le corps. Haricot, œuf, poisson et lait sont tes alliés.', w: { protein: 2 } },
  hydratation: { title: 'Bien boire', icon: 'droplet', why: 'L’eau aide ton corps à fonctionner, surtout quand il fait chaud. Beaucoup de fatigues viennent d’un manque d’eau.', w: { refresh: 3 } },
  fer: { title: 'Plus de fer', icon: 'leafy-green', why: 'Le fer combat la fatigue et l’anémie, fréquentes chez les femmes et les ados. Un fruit au repas aide à mieux l’absorber.', w: { iron: 3, vitc: 1, folate: 1 } },
  glycemie: { title: 'Stabiliser le sucre', icon: 'sheaf-of-rice', why: 'Avec le diabète, mil, fonio et haricot font monter le sucre lentement. On réduit le riz blanc, le pain blanc et tout ce qui est sucré.', w: { lowgi: 3, fiber: 1, refined: -3, sweet: -4 } },
  sel: { title: 'Moins de sel', icon: 'salt', why: 'Le sel fait monter la tension, et un seul cube en contient beaucoup. Le soumbala garde le goût avec bien moins de sel.', w: { salty: -4, veg: 1 } },
  cholesterol: { title: 'Moins de gras', icon: 'red-heart', why: 'Moins d’huile et de friture protège ton cœur et tes vaisseaux. Les fibres du mil et du haricot aident aussi.', w: { fat: -3, lowfat: 2, fiber: 1 } },
  poids: { title: 'Poids de forme', icon: 'bullseye', why: 'Plus de légumes, moins d’huile et de sucre, sans sauter de repas : c’est durable et sans privation.', w: { fat: -3, lowfat: 2, fiber: 2, veg: 2, sweet: -2, refined: -1 } },
  prise: { title: 'Reprendre des forces', icon: 'banana', why: 'Ton poids est un peu bas. Des repas réguliers et des collations nourrissantes vont t’aider.', w: { energy: 3, protein: 2, fat: 1 } },
  estomac: { title: 'Ménager l’estomac', icon: 'bowl-with-spoon', why: 'Des repas doux et réguliers, avec peu de friture et de piment, soulagent un estomac sensible.', w: { soft: 3, fat: -2, raw: -1, digest: 2 } },
  petit_dej: { title: 'Un vrai petit-déjeuner', icon: 'bowl-with-spoon', why: 'Sans petit-déjeuner, on manque d’énergie le matin et on grignote sucré. Même une bouillie rapide change tout.', w: { energy: 1 } },
  sucre: { title: 'Moins de sucre', icon: 'cup-with-straw', why: 'Les boissons sucrées apportent beaucoup de sucre sans nourrir. L’eau, le bissap ou le bouye sans sucre font aussi bien.', w: { sweet: -3 } },
  legumes: { title: 'Plus de légumes', icon: 'leafy-green', why: 'Les légumes et les feuilles apportent fibres, vitamines et minéraux pour presque rien.', w: { veg: 3, folate: 1 } },
  fruits: { title: 'Un fruit par jour', icon: 'tangerine', why: 'Un fruit de saison par jour apporte de la vitamine C pour les défenses et aide à absorber le fer.', w: { fruit: 2, vitc: 1 } },
  calcium_proteines: { title: 'Os et muscles solides', icon: 'glass-of-milk', why: 'Avec l’âge, on a besoin de calcium et de protéines, dans des plats faciles à manger.', w: { calcium: 2, protein: 2, soft: 2 } },
  energie: { title: 'Énergie toute la journée', icon: 'person-running', why: 'Trois repas réguliers avec des céréales locales et des protéines évitent les coups de fatigue.', w: { energy: 2, protein: 1 } },
  appetit: { title: 'Retrouver l’appétit', icon: 'bowl-with-spoon', why: 'Quand on n’a pas faim, on saute des repas et la fatigue s’installe. Petites portions, plats parfumés et heures fixes réveillent l’appétit.', w: { energy: 2, soft: 2, protein: 1, appetite: 3 } },
  equilibre: { title: 'Garder l’équilibre', icon: 'bullseye', why: 'Tes habitudes sont déjà bonnes. On garde le cap avec des repas variés.', w: { veg: 1, protein: 1, fiber: 1 } }
};

export const DEFAULT_PROFILE = {
  name: '', sex: null, age: null, activity: 'moyenne', weight: null, height: null,
  goal: 'equilibre', conditions: [], pregnancy: 'non', allergies: [], diet: 'tout', country: null, answered: {},
  habits: { breakfast: 'souvent', veggies: 'parfois', fruits: 'parfois', sugary: 'parfois', cube: 'un', appetite: 'bon', water: '1_2' },
  budget: 2000, lang: 'Français',
  notif: { meals: true, water: true, tips: false }, assessedAt: null
};

const fertileAge = (age) => age === '13-17' || age === '18-34' || age === '35-59';
const tierOf = (budget) => (BUDGETS.find((b) => b.id === budget) || BUDGETS[1]).tier;

/* ---------- Bilan ---------- */
export function assess(p) {
  const cand = {};
  const add = (id, score, from) => { if (!cand[id] || cand[id].score < score) cand[id] = { id, score, from }; };
  const pregnant = p.sex === 'f' && p.pregnancy === 'enceinte';
  const nursing = p.sex === 'f' && p.pregnancy === 'allaite';
  const cond = p.conditions || [];
  const h = p.habits || {};

  if (pregnant) { add('fer_folates', 100, 'grossesse'); add('securite', 95, 'grossesse'); add('proteines', 90, 'grossesse'); }
  if (nursing) { add('hydratation', 100, 'allaitement'); add('proteines', 95, 'allaitement'); add('energie', 85, 'allaitement'); }
  if (cond.includes('diabete')) add('glycemie', 98, 'diabète');
  if (cond.includes('tension')) add('sel', 97, 'tension');
  if (cond.includes('anemie')) { if (pregnant) { cand.fer_folates.from = 'grossesse et anémie'; } else add('fer', 96, 'anémie'); }
  if (cond.includes('cholesterol')) add('cholesterol', 92, 'cholestérol');
  if (cond.includes('estomac')) add('estomac', 90, 'estomac sensible');

  // Indice de masse corporelle (adultes, hors grossesse) : seulement indicatif
  let bmi = null;
  const w = Number(p.weight), hcm = Number(p.height);
  if (w >= 25 && w <= 250 && hcm >= 120 && hcm <= 220) {
    const v = Math.round((w / Math.pow(hcm / 100, 2)) * 10) / 10;
    const adult = p.age && p.age !== '13-17';
    let band = null;
    if (adult && !pregnant) {
      if (v < 18.5) { band = 'bas'; add('prise', 88, 'poids'); }
      else if (v < 25) band = 'forme';
      else if (v < 30) { band = 'surpoids'; add('poids', 85, 'poids'); }
      else { band = 'obesite'; add('poids', 89, 'poids'); }
    }
    bmi = { value: v, band, label: { bas: 'Poids un peu bas', forme: 'Poids de forme', surpoids: 'Léger surpoids', obesite: 'Surpoids important' }[band] || null,
      note: !adult ? "Chez les ados, l'IMC se lit avec des courbes de croissance : demande à un agent de santé." : pregnant ? "Pendant la grossesse, c'est la prise de poids qui compte : suis les conseils de ta sage-femme." : null };
  }

  if (p.goal === 'poids' && !pregnant) add('poids', 80, 'objectif');
  if (p.goal === 'energie') add('energie', 60, 'objectif');
  if (p.age === '60+') add('calcium_proteines', 75, 'âge');
  if (p.sex === 'f' && fertileAge(p.age) && !pregnant) add('fer', 55, 'besoins des femmes');
  if (p.age === '13-17') add('energie', 58, 'croissance');
  if (p.activity === 'forte') add('energie', 62, 'activité');

  if (h.cube === 'plusieurs') add('sel', 70, 'habitudes'); else if (h.cube === 'un') add('sel', 40, 'habitudes');
  if (h.sugary === 'chaque_jour') add('sucre', 72, 'habitudes'); else if (h.sugary === 'parfois') add('sucre', 35, 'habitudes');
  if (h.breakfast === 'rarement') add('petit_dej', 68, 'habitudes'); else if (h.breakfast === 'parfois') add('petit_dej', 32, 'habitudes');
  if (h.veggies === 'rarement') add('legumes', 66, 'habitudes'); else if (h.veggies === 'parfois') add('legumes', 38, 'habitudes');
  if (h.fruits === 'rarement') add('fruits', 50, 'habitudes'); else if (h.fruits === 'parfois') add('fruits', 30, 'habitudes');
  if (h.appetite === 'faible') add('appetit', 87, 'appétit'); else if (h.appetite === 'variable') add('appetit', 52, 'appétit');
  if (h.water === 'moins_1') add('hydratation', 64, 'habitudes'); else if (h.water === '1_2') add('hydratation', 28, 'habitudes');

  const ranked = Object.values(cand).sort((a, b) => b.score - a.score);
  let top = ranked.filter((c) => c.score >= 45).slice(0, 3);
  if (!top.length) top = [{ id: 'equilibre', score: 50, from: 'habitudes' }];
  const watch = ranked.filter((c) => !top.includes(c) && c.score >= 28).slice(0, 3);
  const priorities = top.map((c) => Object.assign({ id: c.id, from: c.from }, PRIORITIES[c.id]));

  // Poids des atouts nutritionnels pour classer les plats
  const weights = { veg: 1, protein: 1, fiber: 0.5 };
  top.forEach((c) => Object.entries(PRIORITIES[c.id].w).forEach(([k, v]) => { weights[k] = (weights[k] || 0) + v; }));
  watch.forEach((c) => Object.entries(PRIORITIES[c.id].w).forEach(([k, v]) => { weights[k] = (weights[k] || 0) + v / 2; }));
  if (p.activity === 'forte' || p.age === '13-17') weights.energy = (weights.energy || 0) + 1;

  // Score des habitudes
  const habitDetails = HABITS.map((q) => {
    const opt = q.opts.find((o) => o[0] === h[q.id]) || q.opts[1];
    return { id: q.id, q: q.q, answer: opt[1], pts: opt[2], good: opt[2] === 2 };
  });
  const habitScore = Math.round(habitDetails.reduce((s, d) => s + d.pts, 0) / (habitDetails.length * 2) * 100);

  // Eau (verres de 250 ml)
  let glasses = 8;
  if (p.activity === 'forte') glasses += 2;
  if (pregnant) glasses = Math.max(glasses, 9);
  if (nursing) glasses = Math.max(glasses, 11);
  if (p.age === '60+') glasses = Math.max(7, glasses - 1);
  if (p.age === '13-17') glasses = Math.max(glasses, 8);

  // À privilégier / à limiter
  const ids = top.map((c) => c.id).concat(watch.map((c) => c.id));
  const favor = new Set(); const limit = new Set();
  const F = (...a) => a.forEach((x) => favor.add(x)); const L = (...a) => a.forEach((x) => limit.add(x));
  if (ids.includes('fer') || ids.includes('fer_folates')) { F('Feuilles vertes (oseille, baobab, moringa)', 'Haricot'); L('Thé ou café pendant les repas'); }
  if (ids.includes('glycemie')) { F('Mil, sorgho, fonio', 'Haricot'); L('Riz blanc en grande quantité', 'Boissons et bouillies sucrées'); }
  if (ids.includes('sel')) { F('Soumbala, ail, oignon, épices'); L('Cubes', 'Poisson séché très salé'); }
  if (ids.includes('poids') || ids.includes('cholesterol')) { F('Plats braisés ou bouillis', 'Légumes à volonté'); L('Friture', 'Huile en excès'); }
  if (ids.includes('sucre')) { F('Eau, bissap ou bouye sans sucre'); L('Sucreries et jus en sachet'); }
  if (ids.includes('legumes')) F('Gombo, chou, carotte, aubergine');
  if (ids.includes('fruits') || ids.includes('fer')) F('Fruits de saison (orange, goyave, mangue)');
  if (ids.includes('proteines') || ids.includes('calcium_proteines')) F('Œuf, poisson, lait, haricot');
  if (ids.includes('securite')) { F('Aliments bien cuits'); L('Œufs crus ou peu cuits', 'Viande ou poisson pas assez cuits', 'Alcool'); }
  if (ids.includes('estomac')) L('Piment fort', 'Friture', 'Repas trop tardifs');
  if (ids.includes('prise')) F('Collations : arachides, banane, bouillie enrichie');
  if (ids.includes('appetit')) { F('Petites portions plus souvent', 'Plats parfumés (gingembre, citron, soumbala)'); L('Boire beaucoup pendant le repas', 'Sauter des repas'); }
  if (!favor.size) F('Légumes et feuilles', 'Haricot', 'Céréales locales');
  if (!limit.size) L('Cubes', 'Boissons sucrées');

  const excluded = (p.allergies || []).map((a) => (ALLERGENS.find((x) => x.id === a) || {}).label).filter(Boolean);
  const notes = [];
  if ((p.allergies || []).length) notes.push("Les aliments qui contiennent tes allergènes sont retirés de tous tes menus. Vérifie quand même les étiquettes (cubes, farines, biscuits) : certains en contiennent sans le dire clairement. En cas d'allergie grave, garde ton traitement d'urgence sur toi.");
  if (cond.includes('diabete') || cond.includes('tension') || cond.includes('cholesterol')) notes.push("Ces conseils accompagnent ton traitement, ils ne le remplacent pas. Continue tes médicaments et tes contrôles comme ton médecin l'a dit.");
  if (pregnant) notes.push('Prends les compléments donnés au centre de santé (fer, acide folique) et va à toutes tes consultations prénatales.');
  if (p.age === '13-17') notes.push("À ton âge, le corps grandit : pas de régime strict. Mange à ta faim, varié, trois fois par jour.");
  if (bmi && bmi.band === 'obesite') notes.push("Un agent de santé peut t'accompagner pour perdre du poids en douceur et vérifier ta tension et ton sucre.");

  return { priorities, watch: watch.map((c) => Object.assign({ id: c.id }, PRIORITIES[c.id])), weights, bmi, habitScore, habitDetails, glasses, favor: [...favor], limit: [...limit], excluded, notes, pregnant, nursing };
}

/* ---------- Plats autorisés et classés ---------- */
export function allowed(meal, p) {
  const al = p.allergies || [];
  if (meal.al.some((a) => al.includes(a))) return false;
  if ((p.pregnancy === 'enceinte' || p.pregnancy === 'allaite') && meal.tags.includes('herbal')) return false;
  if ((p.conditions || []).includes('estomac') && meal.id === 'gingembre') return false;
  if (p.diet === 'vegetarien' && (meal.tags.includes('meat') || meal.tags.includes('fish') || meal.al.includes('crustaces'))) return false;
  if (!fromHere(meal, p)) return false;
  return true;
}

/* ---------- Pays : plats d'ici, nom local, petite fiche ---------- */
const realCountry = (p) => !!(p.country && COUNTRIES.some((c) => c.id === p.country && !c.id.startsWith('autre')));
// Plat courant dans le pays de la personne (les plats sans pays sont courants partout)
function fromHere(meal, p) {
  const c = (DETAILS[meal.id] || {}).c;
  return !c || !realCountry(p) || c.includes(p.country);
}
export function isLocal(meal, p) { const c = (DETAILS[meal.id] || {}).c; return !!(c && realCountry(p) && c.includes(p.country)); }
// Les plats signature du pays (courants dans 1 ou 2 pays) passent devant les plats régionaux
function localBonus(meal, p) { if (!isLocal(meal, p)) return 0; return DETAILS[meal.id].c.length <= 2 ? 3 : 1.5; }
export function localize(meal, p) {
  const D = DETAILS[meal.id] || {};
  const local = (D.local && p.country && D.local[p.country]) || null;
  return Object.assign({}, meal, { name: local || meal.name, baseName: meal.name, desc: D.d || '', min: D.min || null, local: isLocal(meal, p) });
}

function scoreMeal(meal, weights) {
  return meal.tags.reduce((s, t) => s + (weights[t] || 0), 0);
}

export function candidates(slot, p, A, date) {
  const tier = tierOf(p.budget);
  const theme = date ? DAY_THEMES[date.getDay()].w : {};
  const W = Object.assign({}, A.weights);
  Object.entries(theme).forEach(([k, v]) => { W[k] = (W[k] || 0) + v; });
  let list = MEALS.filter((m) => m.slot === slot && allowed(m, p));
  const inBudget = list.filter((m) => m.cost <= tier);
  if (inBudget.length) list = inBudget;
  return list.map((m) => ({ m, s: scoreMeal(m, W) + localBonus(m, p) })).sort((a, b) => b.s - a.s || a.m.cost - b.m.cost || a.m.id.localeCompare(b.m.id));
}

const dayNum = (d) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);

// Plan d'une journée : choix déterministe parmi les meilleurs plats, avec variété d'un jour à l'autre
export function planDay(date, p, A, swaps = {}, key = '', picks = {}) {
  const n = dayNum(date);
  return SLOT_ORDER.map((slot, si) => {
    const list = candidates(slot, p, A, date);
    if (!list.length) return { slot, key: slot, empty: true, name: 'Repas libre', portion: 'Aucun plat du catalogue ne convient à tes allergies : demande conseil à Kalou.', reasons: [], icon: 'thinking-face', ing: [] };
    const picked = picks[key + ':' + slot] && list.find((x) => x.m.id === picks[key + ':' + slot]);
    if (picked) return Object.assign({ key: slot, reasons: explain(picked.m, p, A), themeHit: themeHit(picked.m, date), picked: true }, localize(picked.m, p), { alternatives: list.length });
    const k = Math.min(slot === 'collation' || slot === 'dessert' || slot === 'bienetre' ? 6 : 5, list.length);
    const swap = swaps[key + ':' + slot] || 0;
    const prevIdx = (n - 1 + si * 3) % k;
    let idx = (n + si * 3 + swap) % k;
    if (idx === prevIdx && k > 1 && !swap) idx = (idx + 1) % k;
    const { m } = list[idx];
    return Object.assign({ key: slot, reasons: explain(m, p, A), themeHit: themeHit(m, date) }, localize(m, p), { alternatives: list.length });
  });
}

export function themeOf(date) { return DAY_THEMES[date.getDay()]; }
function themeHit(m, date) { const w = DAY_THEMES[date.getDay()].w; return m.tags.some((t) => (w[t] || 0) > 0); }

// Pourquoi ce plat, pour cette personne
export function explain(m, p, A) {
  const out = [];
  const pos = m.tags.filter((t) => (A.weights[t] || 0) > 0.5 && TAG_REASON[t]).sort((a, b) => A.weights[b] - A.weights[a]);
  pos.slice(0, 2).forEach((t) => out.push(TAG_REASON[t]));
  const ids = A.priorities.map((x) => x.id);
  if (ids.includes('glycemie') && m.tags.includes('refined')) out.push('garde le riz à ¼ de l’assiette');
  if (ids.includes('glycemie') && m.tags.includes('sweet')) out.push('une seule portion, avec un repas');
  if ((ids.includes('poids') || ids.includes('cholesterol')) && m.tags.includes('fat')) out.push('une cuillère d’huile par personne');
  if (ids.includes('sel') && m.tags.includes('salty')) out.push('rince le poisson séché, sans cube');
  if (ids.includes('securite') && m.tags.includes('raw')) out.push('crudités très bien lavées');
  if (ids.includes('prise')) out.push('portion généreuse');
  if (ids.includes('appetit')) out.push('commence par une petite portion');
  if (!out.length) out.push('équilibré et de saison');
  return out.slice(0, 3);
}

/* ---------- Défis et conseils ---------- */
export function missionFor(A) {
  const id = A.priorities.find((x) => MISSIONS[x.id]) ? A.priorities.find((x) => MISSIONS[x.id]).id : 'equilibre';
  return Object.assign({ id }, MISSIONS[id]);
}

export function tipsFor(A) {
  const ids = A.priorities.map((x) => x.id).concat(A.watch.map((x) => x.id));
  const mine = TIPS.filter((t) => t.for.some((f) => ids.includes(f)));
  const rest = TIPS.filter((t) => !mine.includes(t));
  return mine.concat(rest);
}

// Liste de courses : ingrédients des repas des prochains jours
export function shopping(days) {
  const map = new Map();
  days.forEach((d) => d.forEach((m) => (m.ing || []).forEach((i) => map.set(i, (map.get(i) || 0) + 1))));
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([name, n]) => ({ name, n }));
}

/* ---------- « Que manger maintenant ? » ---------- */
export function slotNow(date = now()) {
  const h = date.getHours() + date.getMinutes() / 60;
  if (h < 9.5) return 'matin';
  if (h < 11.5) return 'collation';
  if (h < 13.5) return 'midi';
  if (h < 15) return 'dessert';
  if (h < 18.5) return 'bienetre';
  return 'soir';
}

/* ---------- « J'ai ces ingrédients » ---------- */
export function canonIng(name) {
  const n = name.toLowerCase();
  if (n.includes('feuille')) return 'Feuilles';
  if (n.includes('farine de petit mil') || n.includes('farine de mil')) return 'Farine de mil';
  if (n.includes('maïs frais')) return 'Farine de maïs';
  if (n.includes('tomate')) return 'Tomates';
  if (n.includes('carotte') || n.includes('chou') || n.includes('salade') || n.includes('concombre')) return 'Carottes, chou, aubergines';
  if (/mangue|orange|goyave|banane|papaye|fruit|avocat/.test(n)) return 'Fruits de saison';
  if (n.includes('yaourt') || n.includes('lait')) return 'Lait en poudre';
  if (n.includes('arachides')) return 'Arachides';
  if (n.includes('poisson séché') || n.includes('crevettes')) return 'Poisson séché';
  return name;
}
const MINOR = new Set(['Citron', 'Oignons', 'Soumbala', 'Pain de singe']);

export function cookWith(have, p, A) {
  const H = new Set(have);
  return MEALS.filter((m) => ['matin', 'midi', 'soir'].includes(m.slot) && allowed(m, p)).map((m) => {
    const need = [...new Set(m.ing.map(canonIng))].filter((i) => !MINOR.has(i));
    const missing = need.filter((i) => !H.has(i));
    const coverage = need.length ? (need.length - missing.length) / need.length : 0;
    return { m, missing, coverage, s: scoreMeal(m, A.weights) };
  }).filter((x) => x.coverage >= 0.5)
    .sort((a, b) => a.missing.length - b.missing.length || b.s - a.s)
    .slice(0, 6)
    .map((x) => Object.assign({ missing: x.missing, reasons: explain(x.m, p, A) }, localize(x.m, p)));
}

/* ---------- La roue : que préparer ? ---------- */
// Plats sûrs pour le profil, du pays, dans le temps disponible. Chaque case a une taille
// proportionnelle à l'intérêt du plat pour le bilan : le hasard penche vers ce qui fait du bien.
export function wheelItems(slot, p, A, date, maxMin) {
  const all = candidates(slot, p, A, date);
  let list = all.filter((x) => !maxMin || (DETAILS[x.m.id] || {}).min <= maxMin);
  let relaxed = false;
  if (list.length < 3) { relaxed = list.length < all.length; list = all.slice().sort((a, b) => ((DETAILS[a.m.id] || {}).min || 0) - ((DETAILS[b.m.id] || {}).min || 0)).slice(0, Math.min(3, all.length)).sort((a, b) => b.s - a.s); }
  list = list.slice(0, 8);
  if (!list.length) return { items: [], relaxed };
  const lo = Math.min(...list.map((x) => x.s)), hi = Math.max(...list.map((x) => x.s));
  const items = list.map((x) => Object.assign({ weight: hi === lo ? 1 : 1 + 2 * (x.s - lo) / (hi - lo), reasons: explain(x.m, p, A) }, localize(x.m, p)));
  const total = items.reduce((t, x) => t + x.weight, 0);
  items.forEach((x) => { x.share = x.weight / total; });
  return { items, relaxed };
}
