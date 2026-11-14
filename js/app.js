import { SHARED_DEFS } from './art.js';
import { HOW, SLOT_ORDER, MAIN_SLOTS, SLOT_INFO, NUTRIENTS, TAG_BENEFIT, DISHES, CHAT_CHIPS, DAY_THEMES, COUNTRIES, OPERATORS, APPETITE_TIPS } from './content.js';
import { assess, planDay, missionFor, tipsFor, shopping, cookWith, slotNow, wheelItems } from './engine.js';
import { now, setTZ, hhmm } from './time.js';
import * as voice from './voice.js';
import { CONFIG } from './config.js';
import { load, save, wipe, fresh, enqueue, flush } from './store.js';
import { makeApi } from './api.js';
import { sfx } from './sfx.js';
import * as V from './views.js';

/* ---------- État ---------- */
let S = load();
let api = makeApi(S.deviceId);
sfx.setEnabled(S.sound);
if (!S.picks) S.picks = {};
if (!S.wheelUse) S.wheelUse = {};
const countryOf = (id = S.profile.country) => COUNTRIES.find((c) => c.id === id) || null;
const applyTZ = () => setTZ((countryOf() || {}).tz || null);
applyTZ();
// Moyens de paiement du pays choisi (+ carte)
function payMethods() {
  const c = countryOf(), ops = c ? c.ops : ['orange', 'moov'];
  return ops.map((id) => Object.assign({ id, phone: true, dial: c ? c.dial : '+226', len: c ? c.len : 8 }, OPERATORS[id]))
    .concat([{ id: 'card', label: 'Carte bancaire', logo: null, icon: 'credit-card', color: '#F2F3F2', phone: false }]);
}
// Prépare le brouillon du bilan : un nouveau profil doit répondre lui-même aux questions obligatoires
function draftFrom(p) {
  const d = clone(p);
  d.answered = Object.assign({}, d.answered || {});
  if (p.assessedAt) d.answered = Object.assign({ health: true, allergies: true, preg: true, goal: true }, d.answered);
  else d.goal = d.goal && d.answered.goal ? d.goal : null;
  return d;
}
const needsBilan = S.onboarded && !S.profile.assessedAt;
const U = {
  screen: S.onboarded ? (needsBilan ? 'setup' : 'home') : 'onb',
  enter: true, onbStep: 0, setupStep: 0, editing: needsBilan, loading: false,
  draft: needsBilan ? draftFrom(S.profile) : null, firstBilan: false, countryOnly: false,
  planOffset: 0, open: null, nutOpen: false,
  cookTab: 'have', have: [], dish: 'rizgras', checked: {},
  chatDraft: '', typing: false,
  offerPlan: S.trial && ['semaine', 'mois'].includes(S.trial.plan) ? S.trial.plan : 'mois', pay: S.pay.method || null, phone: '',
  wheel: { slot: null, time: 30, spins: 0, result: null, rot: 0, spinning: false, msg: null },
  showCode: false, code: '', info: null
};
let installEvt = null;
function clone(o) { return JSON.parse(JSON.stringify(o)); }

/* ---------- Dates ---------- */
const pad = (n) => String(n).padStart(2, '0');
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function dateAt(off) { const d = now(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + off); return d; }
const nowHM = () => { const d = now(); return d.getHours() + ':' + pad(d.getMinutes()); };
function weekKey(d = now()) { const x = new Date(d); x.setDate(x.getDate() - (x.getDay() + 6) % 7); return dayKey(x); }
function untilMidnight() { const n = now(), s = 86400 - (n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds()); return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(pad).join(':'); }
const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- Valeurs calculées ---------- */
let cacheA = null, cacheKey = '';
function analysis() {
  const k = JSON.stringify(S.profile);
  if (k !== cacheKey) { cacheA = assess(S.profile); cacheKey = k; }
  return cacheA;
}
function streak() {
  const active = (k) => MAIN_SLOTS.filter((s) => (S.meals[k] || {})[s]).length >= 2;
  let n = 0; const d = now();
  if (!active(dayKey(d))) d.setDate(d.getDate() - 1);
  while (active(dayKey(d)) && n < 999) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function computed() {
  const A = analysis();
  const t = S.trial;
  const end = t ? new Date(t.startedAt).getTime() + CONFIG.trialHours * 3600000 : 0;
  const trialOn = !!(t && !t.cancelledAt && Date.now() < end);
  const paidUntil = S.plus && S.plus.until ? new Date(S.plus.until).getTime() : 0;
  const paid = paidUntil > Date.now();
  const isPlus = trialOn || paid;
  const dayCache = {};
  const day = (off) => {
    if (dayCache[off]) return dayCache[off];
    const d = dateAt(off), k = dayKey(d), logs = S.meals[k] || {};
    return (dayCache[off] = planDay(d, S.profile, A, S.swaps, k, S.picks).map((m) => Object.assign({}, m, { takenAt: logs[m.slot] || null })));
  };
  return {
    A, isPlus, dateAt, day, dark: isDark(), voices: voice.voices(), voiceNow: voice.bestVoice(), prettyVoice: voice.prettyName, cloudVoices: voice.CLOUD_VOICES, cloudVoice: voice.cloudVoice(), cloudOff: voice.cloudOff(), now: now(), slotNow: slotNow(), country: countryOf(), payMethods: payMethods(),
    wheel: (slot, maxMin) => wheelItems(slot, S.profile, A, dateAt(0), maxMin),
    wheelLeft: (slot) => 4 - (S.wheelUse[dayKey(now()) + ':' + slot] || 0),
    untilMidnight: untilMidnight(),
    trialOn, paid, paidPlan: paid ? S.plus.plan : null, paidUntil: paid ? new Date(paidUntil) : null,
    daysLeft: paid ? Math.max(1, Math.ceil((paidUntil - Date.now()) / 86400000)) : 0,
    payReady: U.payReady, payMode: U.payMode, paying: U.paying,
    chariowLink: (plan) => (CONFIG.chariow || {})[plan] || null, licBusy: U.licBusy, licKey: U.licKey || '',
    hoursLeft: trialOn ? Math.max(1, Math.ceil((end - Date.now()) / 3600000)) : 0,
    trialUsed: !!(t && (t.cancelledAt || Date.now() >= end)),
    orgName: S.orgName || null,
    canInstall: !!installEvt,
    hasAppetite: A.priorities.concat(A.watch).some((x) => x.id === 'appetit'),
    theme: (off) => DAY_THEMES[dateAt(off).getDay()],
    waterToday: () => S.water[dayKey(now())] || 0,
    improvesThisWeek() { const lim = Date.now() - 7 * 86400000; return S.improvements.filter((x) => new Date(x.at).getTime() > lim).length; },
    cookWith: (have) => cookWith(have, S.profile, A),
    shopping: (n) => shopping([...Array(n)].map((_, i) => day(i))),
    tip() { const list = tipsFor(A); return list[S.tip % list.length].t; },
    streak: streak(),
    heroMeal() {
      const today = day(0), nowSlot = slotNow();
      const m = today.slice(SLOT_ORDER.indexOf(nowSlot)).find((x) => !x.takenAt) || null;
      if (!m) return null;
      const n = now(), mins = toMin(SLOT_INFO[m.slot].time) - (n.getHours() * 60 + n.getMinutes());
      const isNow = m.slot === nowSlot || mins <= 20;
      const when = isNow ? 'C’est le moment' : mins >= 60 ? `Dans ${Math.floor(mins / 60)} h ${mins % 60 ? pad(mins % 60) : ''}`.trim() : `Dans ${mins} min`;
      const gives = m.tags.filter((tg) => TAG_BENEFIT[tg]).sort((a, b) => (A.weights[b] || 0) - (A.weights[a] || 0)).slice(0, 3).map((tg) => TAG_BENEFIT[tg]);
      return Object.assign({}, m, { isNow, when, gives: gives.length ? gives : ['un repas équilibré et de saison'] });
    },
    nutrients() {
      const today = day(0), got = new Set();
      today.filter((m) => m.takenAt).forEach((m) => m.tags.forEach((x) => got.add(x)));
      const list = NUTRIENTS.map((n) => Object.assign({ on: n.tags.some((x) => got.has(x)) }, n));
      const missing = list.filter((n) => !n.on);
      let next = null;
      for (const m of today.filter((x) => !x.takenAt)) {
        const adds = missing.filter((n) => n.tags.some((x) => m.tags.includes(x))).map((n) => n.label);
        if (adds.length) { next = { slot: SLOT_INFO[m.slot].label.toLowerCase(), adds }; break; }
      }
      return { list, covered: list.length - missing.length, total: list.length, missing, next };
    },
    mission() {
      const m = missionFor(A), wk = weekKey();
      const rec = S.missions[wk] && S.missions[wk].id === m.id ? S.missions[wk] : { id: m.id, days: [] };
      return Object.assign({}, m, { done: rec.days.length, today: rec.days.includes(dayKey(now())) });
    }
  };
}

/* ---------- Rendu ---------- */
const root = document.getElementById('app');
const darkMQ = matchMedia('(prefers-color-scheme: dark)');
const isDark = () => S.theme === 'sombre' || (S.theme === 'auto' && darkMQ.matches);
darkMQ.addEventListener?.('change', () => { if (S.theme === 'auto') render(); });
const scroller = () => root.querySelector('.scroll');
const TAB_SCREENS = ['home', 'plan', 'cook', 'market', 'profile'];
const VIEWS = { wheel: V.wheel, onb: V.onboarding, setup: V.setup, bilan: V.bilan, home: V.home, plan: V.plan, cook: V.cook, market: V.market, chat: V.chat, profile: V.profile, offers: V.offers };
function render(keepScroll = true) {
  const C = computed(), prev = scroller();
  const top = keepScroll && !U.enter && prev ? prev.scrollTop : 0;
  const tabs = TAB_SCREENS.includes(U.screen);
  const dark = isDark();
  root.className = 'app' + (U.enter ? ' enter' : '') + (dark ? ' theme-dark' : '');
  document.documentElement.classList.toggle('theme-dark', dark);
  const mt = document.querySelector('meta[name=theme-color]'); if (mt) mt.content = dark ? '#0E1410' : '#2C7546';
  root.innerHTML = SHARED_DEFS + `<main class="scroll ${tabs ? 'has-tabs' : ''}" id="main" tabindex="-1">${VIEWS[U.screen](S, U, C)}</main>` + (tabs ? V.tabbar(U.screen) : '');
  const sc = scroller(); if (sc) sc.scrollTop = top;
  if (U.screen === 'chat') { const l = document.getElementById('chat-list'); if (l) l.scrollTop = l.scrollHeight; }
  U.enter = false;
}
function go(screen) {
  if (screen !== U.screen) sfx.swoosh();
  U.screen = screen; U.enter = true; U.info = null; U.open = null;
  history.replaceState(null, '', screen === 'home' ? '/' : '#' + screen);
  render(false);
  const main = document.getElementById('main'); if (main) main.focus({ preventScroll: true });
}
const persist = () => save(S);
const sync = () => flush(S, api);

/* ---------- Toast et confettis ---------- */
let toastT;
function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.innerHTML = '<i>✓</i><span></span>'; el.querySelector('span').textContent = msg;
  el.className = 'toast show'; clearTimeout(toastT); toastT = setTimeout(() => { el.className = 'toast'; }, 3200);
}
function celebrate(big) {
  big ? sfx.celebrate() : sfx.success();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = document.createElement('div'); box.className = 'confetti';
  const colors = ['#F59E0B', '#2F8F4E', '#F05A3C', '#2563EB', '#FFD25A', '#7CCB6E', '#FF8A3D'];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2, r = 110 + (i % 4) * 35, s = document.createElement('span');
    s.style.cssText = `background:${colors[i % 7]};--x:${Math.round(Math.cos(a) * r)}px;--y:${Math.round(Math.sin(a) * r)}px;animation-delay:${(i % 3) * 0.05}s`;
    box.appendChild(s);
  }
  document.body.appendChild(box); if (navigator.vibrate) navigator.vibrate(30);
  setTimeout(() => box.remove(), 1600);
}

/* ---------- Kalou : réponses selon le bilan ---------- */
function kalouReply(text) {
  const t = text.toLowerCase(), p = S.profile, A = analysis(), C = computed();
  const prios = A.priorities.map((x) => x.title.toLowerCase());
  const has = (id) => A.priorities.concat(A.watch).some((x) => x.id === id);
  const al = A.excluded;
  if (/pourquoi|menu pour moi|mon plan/.test(t)) return `Ton plan suit ton bilan. Tes priorités : ${prios.join(', ')}.\nChaque plat est choisi pour ça${al.length ? ', sans ' + al.join(', ').toLowerCase() : ''}, et selon le thème du jour (aujourd'hui : ${C.theme(0).title.toLowerCase()}). Ouvre « Semaine » pour voir le pourquoi de chaque repas.`;
  if (/allerg/.test(t)) return al.length ? `Je retire de tous tes menus : ${al.join(', ').toLowerCase()}.\nAttention aux étiquettes : cubes, farines et biscuits peuvent en contenir. En cas d'allergie grave, garde ton traitement d'urgence sur toi.` : "Tu ne m'as signalé aucune allergie. Si ça change, refais ton bilan depuis le profil : je retirerai les aliments concernés.";
  if (/faim|appétit|appetit|envie de manger/.test(t)) return 'Quand l’appétit manque :\n• ' + APPETITE_TIPS.slice(0, 4).join('\n• ');
  if (/grignot/.test(t)) return "Le grignotage du soir vient souvent d'un repas sauté ou trop léger dans la journée. Suis ta collation de 10 h et ta boisson bien-être de 17 h : tu arriveras au dîner sans fringale. Si l'envie revient : un fruit ou un verre d'eau citronnée.";
  if (/soir|dîner|diner/.test(t)) { const m = C.day(0).find((x) => x.slot === 'soir'); return `Ce soir, je te propose : ${m.name} (${m.portion}).\nPourquoi : ${m.reasons.join(', ')}. Et dîne 2 heures avant de dormir.`; }
  if (/dessert|sucré|gâteau|gateau/.test(t)) { const m = C.day(0).find((x) => x.slot === 'dessert'); return `Ton dessert du jour : ${m.name}. Un dessert à base de fruits fait plaisir sans alourdir ta journée.`; }
  if (/riz/.test(t) && has('glycemie')) return "Avec ton diabète, tu peux garder le riz, mais en petite part : un quart de l'assiette, avec beaucoup de légumes et une protéine. Le mil, le fonio et le haricot sont encore mieux pour ton sucre.";
  if (/diab|sucre/.test(t)) return has('glycemie') ? 'Ton plan privilégie déjà mil, fonio et haricot, et limite le riz blanc et le sucré. Continue ton traitement et tes contrôles.' : 'Pour garder un sucre stable : moins de boissons sucrées, plus de mil, de fonio et de haricot. Au moindre doute, fais un test de glycémie au centre de santé.';
  if (/eau|boire|soif/.test(t)) return `Ton objectif : ${A.glasses} verres par jour (environ ${(A.glasses * 0.25).toFixed(1).replace('.', ',')} litres). Tu en es à ${C.waterToday()} aujourd'hui.`;
  if (/enceinte|grossesse/.test(t)) return 'Pendant la grossesse : feuilles vertes, haricot, poisson et œufs bien cuits pour le fer et les protéines. Pas de tisanes sans avis médical. Prends les compléments du centre de santé.';
  if (/tension|sel/.test(t)) return 'Pour la tension : pas de cube, du soumbala à la place, plus de légumes et de fruits. Rince le poisson séché. Continue ton traitement.';
  if (/cher|budget|prix|argent|dépens|depens/.test(t)) return "Haricot, feuilles, mil et fruits de saison sont parmi les aliments les plus nourrissants et les moins chers. Ta liste est dans l'onglet Courses.";
  if (/enfant/.test(t)) return "Mon Assiette est réglé sur ton propre bilan. Pour un enfant, demande conseil au centre de santé.";
  if (/fatigu|énergie|energie/.test(t)) return "Contre la fatigue : ne saute pas le petit-déjeuner, mange des feuilles vertes et du haricot (fer), bois assez d'eau. Si la fatigue dure, consulte un agent de santé.";
  if (/merci/.test(t)) return 'Avec plaisir ! Je suis là quand tu veux.';
  if (/bonjour|salut|bonsoir|coucou/.test(t)) return `Bonjour ${p.name} ! Ta priorité du moment : ${prios[0]}. Pose-moi ta question.`;
  return "Bonne question ! Je n'ai pas encore de réponse sûre à ça. Avec Plus, tu peux la poser directement à une nutritionniste.";
}
function ask(text) {
  const q = (text || '').trim(); if (!q || U.typing) return;
  if (!S.chat.length) S.chat.push({ from: 'kalou', text: 'Salut ' + S.profile.name + ' ! Je connais ton bilan. Pose-moi une question sur tes repas.' });
  S.chat.push({ from: 'me', text: q }); S.chat = S.chat.slice(-60);
  U.chatDraft = ''; U.typing = true; sfx.send();
  enqueue(S, { t: 'question', text: q, expert: false }); persist(); render(); sync();
  setTimeout(() => { S.chat.push({ from: 'kalou', text: kalouReply(q) }); U.typing = false; persist(); sfx.receive(); if (U.screen === 'chat') render(); }, 900);
}

/* ---------- Actions ---------- */
const setD = (k, v) => { U.draft[k] = v; sfx.tick(); render(); };
const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : arr.concat(v));
const ACT = {
  go: (a) => { voice.stop(); U.speaking = null; go(a); },
  onbNext() { sfx.tap(); if (U.onbStep < 2) { U.onbStep++; U.enter = true; render(false); } else ACT.onbSkip(); },
  onbPrev() { sfx.tap(); U.onbStep = Math.max(0, U.onbStep - 1); U.enter = true; render(false); },
  onbGo(a) { sfx.tap(); U.onbStep = +a; U.enter = true; render(false); },
  onbSkip() { U.draft = draftFrom(S.profile); U.setupStep = 0; U.editing = false; go('setup'); },
  setSex(a) { U.draft.sex = a; if (a === 'm') U.draft.pregnancy = 'non'; sfx.tick(); render(); },
  setAge(a) { setD('age', a); },
  setActivity(a) { setD('activity', a); },
  setCountry(a) { setD('country', a); },
  setGoal(a) { U.draft.answered.goal = true; setD('goal', a); },
  toggleCond(a) { U.draft.answered.health = true; setD('conditions', toggleIn(U.draft.conditions, a)); },
  noCond() { U.draft.answered.health = true; setD('conditions', []); },
  setPreg(a) { U.draft.answered.preg = true; setD('pregnancy', a); },
  toggleAllergy(a) { U.draft.answered.allergies = true; setD('allergies', toggleIn(U.draft.allergies, a)); },
  noAllergy() { U.draft.answered.allergies = true; setD('allergies', []); },
  skipStep() { sfx.tap(); if (U.setupStep < V.SETUP_STEPS - 1) { U.setupStep++; U.enter = true; render(false); } else ACT.setupNext(); },
  askCountry() { U.draft = draftFrom(S.profile); U.setupStep = 1; U.editing = true; U.countryOnly = true; go('setup'); },
  setDiet(a) { setD('diet', a); },
  setHabit(a) { const [k, v] = a.split(':'); U.draft.habits = Object.assign({}, U.draft.habits, { [k]: v }); sfx.tick(); render(); },
  setupBack() { sfx.tap(); if (U.countryOnly) { U.countryOnly = false; go(S.profile.assessedAt ? 'home' : 'onb'); return; } if (U.setupStep > 0) { U.setupStep--; U.enter = true; render(false); } else go(U.editing && S.profile.assessedAt ? 'profile' : 'onb'); },
  setupNext() {
    const d = U.draft, st = U.setupStep;
    const miss = V.missingAnswer(st, d);
    if (miss) { sfx.error(); toast(miss); return; }
    sfx.tap();
    if (U.countryOnly) {
      S.profile = Object.assign({}, S.profile, { country: d.country }); applyTZ(); U.countryOnly = false; U.editing = false; U.pay = null;
      enqueue(S, { t: 'profile' }); persist(); sync(); go('home'); celebrate(); toast('Ton menu et ton heure suivent maintenant : ' + countryOf().label + '.'); return;
    }
    if (st < V.SETUP_STEPS - 1) { U.setupStep++; U.enter = true; render(false); return; }
    d.name = d.name.trim().slice(0, 40);
    d.weight = d.weight ? Number(d.weight) : null; d.height = d.height ? Number(d.height) : null;
    d.assessedAt = new Date().toISOString();
    const wasAssessed = !!S.profile.assessedAt;
    S.profile = Object.assign({}, S.profile, d); applyTZ(); U.pay = null;
    S.swaps = {}; enqueue(S, { t: 'profile' });
    U.loading = true; render(false);
    setTimeout(() => { S.onboarded = true; U.loading = false; U.editing = false; U.firstBilan = !wasAssessed; persist(); sync(); go('bilan'); celebrate(true); }, 2300);
  },
  bilanDone() { const first = U.firstBilan; U.firstBilan = false; go('home'); if (first) toast('Voici ta journée idéale, ' + S.profile.name + ' !'); },
  editProfile() { U.draft = draftFrom(S.profile); U.setupStep = 0; U.editing = true; go('setup'); },
  eat(slot) {
    const k = dayKey(now()), logs = Object.assign({}, S.meals[k] || {});
    if (logs[slot]) { delete logs[slot]; enqueue(S, { t: 'unmeal', day: k, key: slot }); sfx.toggle(false); }
    else {
      logs[slot] = nowHM(); enqueue(S, { t: 'meal', day: k, key: slot, at: new Date().toISOString() });
      const doneMain = MAIN_SLOTS.every((m) => logs[m]);
      const m = computed().day(0).find((x) => x.slot === slot);
      const ben = m && m.tags.find((x) => TAG_BENEFIT[x]);
      celebrate(doneMain);
      toast(doneMain ? 'Journée parfaite ! Ton corps a reçu ce dont il avait besoin.' : 'Bien joué ! Tu viens de te donner ' + (ben ? TAG_BENEFIT[ben] : 'un repas équilibré') + '.');
    }
    S.meals[k] = logs; persist(); render(); sync();
  },
  recipe(k) { U.open = U.open === k ? null : k; sfx.tap(); render(); },
  swap(k) {
    const [off, slot] = k.split(':');
    if (!computed().isPlus) {
      const today = dayKey(now());
      S.swapUse = S.swapUse && S.swapUse.day === today ? S.swapUse : { day: today, n: 0 };
      if (S.swapUse.n >= 1) { sfx.error(); toast('Une autre idée par jour en gratuit. Avec Plus, change autant que tu veux.'); return; }
      S.swapUse.n++;
    }
    const key = dayKey(dateAt(+off)) + ':' + slot;
    S.swaps[key] = (S.swaps[key] || 0) + 1; persist(); sfx.toggle(true); render();
    const m = computed().day(+off).find((x) => x.slot === slot);
    toast('Nouvelle idée : ' + m.name + '.');
  },
  waterPlus() {
    const k = dayKey(now()), goal = analysis().glasses, before = S.water[k] || 0, w = Math.min(goal + 4, before + 1);
    S.water[k] = w; enqueue(S, { t: 'water', day: k, glasses: w }); sfx.water();
    if (w === goal) { celebrate(true); toast("Objectif d'eau atteint : " + goal + ' verres !'); }
    persist(); render(); sync();
  },
  waterMinus() { const k = dayKey(now()), w = Math.max(0, (S.water[k] || 0) - 1); S.water[k] = w; enqueue(S, { t: 'water', day: k, glasses: w }); sfx.tap(); persist(); render(); sync(); },
  missionDone() {
    const m = computed().mission(), wk = weekKey(), today = dayKey(now());
    const rec = S.missions[wk] && S.missions[wk].id === m.id ? S.missions[wk] : { id: m.id, days: [] };
    if (!rec.days.includes(today)) rec.days.push(today);
    S.missions = { [wk]: rec }; persist();
    const done = rec.days.length >= m.goal; celebrate(done); render();
    toast(done ? 'Défi de la semaine réussi ! Bravo ' + S.profile.name + ' !' : `Défi validé pour aujourd'hui : ${rec.days.length}/${m.goal}.`);
  },
  nextTip() { S.tip = (S.tip + 1) % 99; sfx.tap(); persist(); render(); },
  speak() { readAloud('tip', computed().tip()); },
  speakMsg(i) { const m = S.chat[+i]; if (m) readAloud('msg' + i, m.text); },
  speakRecipe(k) { const m = recipeMeal(k); if (m) readAloud('recipe', `${m.name}. ${m.desc || ''} Il te faut : ${(m.ing || []).join(', ')}. ${(HOW[m.id] || []).map((x, i) => 'Étape ' + (i + 1) + '. ' + x).join(' ')} Bon appétit !`); },
  pickVoice(uri) { S.voice = uri; applyVoice(); persist(); readAloud('test', `Bonjour ${S.profile.name || ''} ! Je suis Kalou. Aujourd'hui, on mange bien, et on se fait plaisir.`); render(); },
  testVoice() { readAloud('test', `Bonjour ${S.profile.name || ''} ! Je suis Kalou. Aujourd'hui, on mange bien, et on se fait plaisir.`); },
  themeInfo() { const th = computed().theme(0); sfx.tap(); toast(th.title + ' : ' + th.why); },
  streakInfo() { const n = computed().streak; sfx.tap(); toast(n ? `${n} jour${n > 1 ? 's' : ''} de suite avec au moins 2 repas notés. Continue !` : 'Note au moins 2 repas aujourd’hui pour démarrer ta série.'); },
  nutInfo() { U.nutOpen = !U.nutOpen; sfx.tap(); render(); },
  planDay(a) { U.planOffset = +a; U.open = null; sfx.tap(); render(); },
  cookTab(a) { U.cookTab = a; U.open = null; sfx.tap(); render(); },
  toggleHave(a) { U.have = toggleIn(U.have, a); U.open = null; sfx.tick(); render(); },
  clearHave() { U.have = []; sfx.tap(); render(); },
  pickDish(a) { U.dish = a; U.checked = {}; sfx.tick(); render(); },
  toggleTip(a) { U.checked = Object.assign({}, U.checked, { [a]: !U.checked[a] }); sfx.tick(); render(); },
  saveImprove() {
    const C = computed();
    if (!C.isPlus && C.improvesThisWeek() >= CONFIG.freeImprovesPerWeek) { go('offers'); return; }
    const okDishes = DISHES.filter((d) => !d.al.some((a) => S.profile.allergies.includes(a)));
    const dish = okDishes.find((d) => d.id === U.dish) || okDishes[0];
    const tips = dish.tips.filter((_, i) => U.checked[i]);
    if (!tips.length) { sfx.error(); toast("Coche au moins un conseil avant d'enregistrer."); return; }
    const score = Math.min(100, dish.base + tips.reduce((s, x) => s + x.pts, 0));
    S.improvements.push({ dish: dish.name, score, at: new Date().toISOString() }); S.improvements = S.improvements.slice(-50);
    enqueue(S, { t: 'improve', dish: dish.name, score, tips: tips.map((x) => x.t) });
    persist(); render(); sync(); celebrate(); toast(dish.name + ' amélioré : ' + score + '/100.');
  },
  toggleItem(name) { S.bought[name] = !S.bought[name]; S.bought[name] ? sfx.tick() : sfx.tap(); persist(); render(); },
  clearList() { S.bought = {}; sfx.tap(); persist(); render(); },
  async shareList() {
    sfx.tap();
    const C = computed(), items = C.shopping(C.isPlus ? 7 : 2);
    const text = 'Mes courses Mon Assiette :\n' + items.map((i) => '• ' + i.name).join('\n') + '\n\n' + location.origin;
    if (navigator.share) { try { await navigator.share({ title: 'Mes courses', text }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
  },
  ask(i) { ask(CHAT_CHIPS[+i]); },
  expert() {
    if (!computed().isPlus) { go('offers'); return; }
    const last = [...S.chat].reverse().find((m) => m.from === 'me');
    if (!last) { toast("Écris d'abord ta question, puis touche « Nutritionniste »."); return; }
    enqueue(S, { t: 'question', text: last.text, expert: true }); persist(); sync(); sfx.success();
    toast('Question envoyée à une nutritionniste. Réponse sous 48 h.');
  },
  toggleSound() { S.sound = !S.sound; sfx.setEnabled(S.sound); if (S.sound) sfx.toggle(true); persist(); render(); },
  toggleNotif(key) {
    const on = !S.profile.notif[key];
    S.profile.notif = Object.assign({}, S.profile.notif, { [key]: on }); sfx.toggle(on);
    enqueue(S, { t: 'profile' }); persist(); render(); sync();
    if (on && 'Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  },
  info(a) { U.info = U.info === a ? null : a; sfx.tap(); render(); },
  async install() { if (!installEvt) return; installEvt.prompt(); await installEvt.userChoice; installEvt = null; render(); },
  wipe() {
    if (!confirm('Effacer toutes tes données de ce téléphone et recommencer ?')) return;
    wipe(); S = fresh(); api = makeApi(S.deviceId); persist();
    Object.assign(U, { onbStep: 0, setupStep: 0, chatDraft: '', checked: {}, have: [], offerPlan: 'mois', phone: '', pay: null, code: '', editing: false, countryOnly: false }); applyTZ();
    go('onb');
  },
  pickPlan(a) { U.offerPlan = a; sfx.tick(); render(); },
  pickPay(a) { U.pay = a; sfx.tick(); render(); },
  wheelSlot(a) { Object.assign(U.wheel, { slot: a, spins: 0, result: null, msg: null }); U.open = null; sfx.tick(); render(); },
  wheelTime(a) { Object.assign(U.wheel, { time: +a, spins: 0, result: null, msg: null }); U.open = null; sfx.tick(); render(); },
  spin() { spinWheel(); },
  setTheme(a) { S.theme = a; sfx.toggle(a !== 'clair'); persist(); render(); },
  wheelSkip() { S.wheelSkip = !S.wheelSkip; sfx.toggle(S.wheelSkip); persist(); render(); },
  wheelRecipe() { U.open = U.open === 'wheel' ? null : 'wheel'; sfx.tap(); render(); },
  wheelPick() {
    const W = U.wheel, m = W.result; if (!m) return;
    const slot = W.slot || slotNow(), k = dayKey(now()) + ':' + slot;
    S.picks[k] = m.id; persist();
    Object.assign(U.wheel, { spins: 0, result: null, msg: null }); go('home'); celebrate();
    toast(`${m.name} : c'est ton ${SLOT_INFO[slot].label.toLowerCase()} d'aujourd'hui. Bon appétit !`);
  },
  toggleCode() { U.showCode = !U.showCode; sfx.tap(); render(); },
  async startTrial() {
    const pays = payMethods(), pay = pays.find((x) => x.id === U.pay) || pays[0];
    const digits = U.phone.replace(/\D/g, '');
    if (pay.phone && digits.length !== pay.len) { sfx.error(); toast('Entre ton numéro ' + pay.label + ' (' + pay.len + ' chiffres).'); document.getElementById('pay-phone')?.focus(); return; }
    if (!navigator.onLine) { sfx.error(); toast("Connexion internet nécessaire pour activer l'essai."); return; }
    S.pay = { method: pay.id, phone: pay.phone ? pay.dial + digits : '' };
    try {
      await flush(S, api);
      const r = await api.startTrial(U.offerPlan);
      if (!r || !r.ok) { sfx.error(); toast(r && r.error === 'trial_used' ? 'Tu as déjà utilisé ton essai gratuit sur ce téléphone.' : "Impossible d'activer l'essai pour le moment."); return; }
      S.trial = { plan: r.plan, startedAt: r.started_at, cancelledAt: null };
      enqueue(S, { t: 'pay', method: S.pay.method, phone: S.pay.phone }); persist(); sync();
      go('home'); celebrate(true); toast('Essai Plus activé : 72 h offertes, sans engagement.');
    } catch (e) { sfx.error(); toast('Connexion instable. Réessaie dans un instant.'); }
  },
  async cancelTrial() {
    if (!confirm('Arrêter ton essai Plus ? Tu ne paieras rien.')) return;
    try { await api.cancelTrial(); } catch (e) { /* arrêt local quand même */ }
    if (S.trial) S.trial.cancelledAt = new Date().toISOString();
    persist(); render(); toast('Essai arrêté. Tu ne paieras rien.');
  },
  notifyMe() { const pm = payMethods().find((x) => x.id === U.pay) || payMethods()[0]; S.pay = { method: pm.id, phone: (pm.dial || '') + U.phone.replace(/\D/g, '') }; enqueue(S, { t: 'pay', method: S.pay.method, phone: S.pay.phone }); persist(); sync(); sfx.success(); toast("C'est noté ! On te prévient dès l'ouverture du paiement."); },
  payNow() { payNow(); },
  payChariow() {
    const link = (CONFIG.chariow || {})[U.offerPlan];
    if (!link) { sfx.error(); toast('Cette formule arrive très bientôt. Choisis-en une autre pour l’instant.'); return; }
    sfx.success(); U.showKey = true; render();
    window.open(link, '_blank', 'noopener');
    toast('Après le paiement, tu recevras ta clé : colle-la ici pour activer Plus.');
  },
  openKey() { U.showKey = true; go('offers'); setTimeout(() => document.querySelector('[data-input=licKey]')?.focus(), 400); },
  toggleKey() { U.showKey = !U.showKey; sfx.tap(); render(); },
  async activateKey() {
    const key = (U.licKey || '').trim();
    if (key.length < 6) { sfx.error(); toast('Colle la clé reçue après ton paiement.'); return; }
    if (!navigator.onLine) { sfx.error(); toast('Connexion internet nécessaire pour activer ta clé.'); return; }
    if (U.licBusy) return;
    U.licBusy = true; render();
    try {
      await flush(S, api);
      const r = await api.license({ key });
      if (r.ok) {
        S.plus = { plan: r.plan, until: r.until }; U.licKey = ''; U.showKey = false; persist();
        go('home'); celebrate(true);
        toast(r.already ? 'Cette clé est déjà active sur ce téléphone.' : 'Clé activée ! Mon Assiette Plus est actif jusqu’au ' + new Date(r.until).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) + '.');
      } else {
        sfx.error();
        toast({ unknown_key: 'Clé introuvable. Vérifie qu’elle est bien copiée en entier.', used_elsewhere: 'Cette clé est déjà utilisée sur un autre téléphone.', expired: 'Cette clé a expiré.', revoked: 'Cette clé a été annulée.', too_many: 'Trop d’essais. Réessaie dans une heure.', not_configured: 'L’activation par clé arrive très bientôt.', activation_failed: 'Cette clé ne peut plus être activée.', unknown_product: 'Cette clé ne correspond pas à Mon Assiette Plus.' }[r.error] || 'Impossible d’activer la clé pour le moment. Réessaie.');
      }
    } catch (e) { sfx.error(); toast('Connexion instable. Réessaie dans un instant.'); }
    U.licBusy = false; render();
  },
  async invite() {
    sfx.tap();
    const text = 'Je sais enfin quoi manger, et pourquoi, avec Mon Assiette et Kalou. Essaie : ' + location.origin;
    if (navigator.share) { try { await navigator.share({ title: 'Mon Assiette', text }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
  }
};

/* ---------- Voix de Kalou ---------- */
// Voix : « cloud:denise » = voix premium du serveur, sinon une voix du téléphone
if (S.voice == null) S.voice = 'cloud:denise';
const applyVoice = () => {
  const cl = String(S.voice || '').startsWith('cloud:');
  voice.setCloud({ url: CONFIG.supabaseUrl + '/functions/v1/ma-tts', key: CONFIG.supabaseKey, device: S.deviceId, voice: cl ? S.voice.slice(6) : null });
  voice.setVoice(cl ? null : S.voice);
};
applyVoice();
voice.probe().then(() => { if (U.screen === 'profile') render(); });
voice.onVoices(() => { if (U.screen === 'profile') render(); });
function readAloud(key, text) {
  if (!voice.supported()) { toast("La lecture audio n'est pas disponible sur ce téléphone."); return; }
  if (U.speaking === key) { voice.stop(); U.speaking = null; render(); return; }
  if (!voice.cloudVoice() && !voice.voices().length) toast('Astuce : installe une voix française dans les réglages du téléphone pour une voix plus naturelle.');
  U.speaking = key; render();
  voice.say(text, { onEnd: () => { if (U.speaking === key) { U.speaking = null; render(); } } });
}
function recipeMeal(k) {
  const C = computed();
  if (k === 'wheel') return U.wheel.result;
  if (k && k.startsWith('cook:')) return C.cookWith(U.have)[+k.split(':')[1]];
  const [off, slot] = (k || '').split(':'); return C.day(+off).find((x) => x.slot === slot);
}

/* ---------- La roue ---------- */
const KALOU_RESPIN = [
  'D’accord, on relance. Mais ce plat-là était très bien pour toi !',
  'Encore ? Kalou commence à avoir le tournis…',
  'Dernière chance : après, on fait confiance à la roue !'
];
function spinWheel() {
  const W = U.wheel; if (W.spinning) return;
  const C = computed(), slot = W.slot || slotNow();
  const { items } = C.wheel(slot, W.time === 999 ? 0 : W.time);
  if (!items.length) return;
  const useKey = dayKey(now()) + ':' + slot;
  if (!C.isPlus && (S.wheelUse[useKey] || 0) >= 4) { sfx.error(); toast('Tes tours pour ce repas sont utilisés. Reviens demain, ou passe à Plus.'); return; }
  // Tirage pondéré : plus la case est grande, plus le plat a de chances de sortir
  let r = Math.random(), idx = 0; for (; idx < items.length - 1; idx++) { r -= items[idx].share; if (r <= 0) break; }
  const starts = []; let acc = 0; items.forEach((x) => { starts.push(acc); acc += x.share * 360; });
  const target = starts[idx] + items[idx].share * 360 * (0.2 + Math.random() * 0.6);
  const from = W.rot, base = ((360 - target - (from % 360)) % 360 + 360) % 360;
  const reduce = S.wheelSkip || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const to = from + base + (reduce ? 360 : 360 * 5), T = S.wheelSkip ? 350 : reduce ? 900 : 4600;
  S.wheelUse = Object.assign(Object.fromEntries(Object.entries(S.wheelUse).filter(([k]) => k.startsWith(dayKey(now())))), { [useKey]: (S.wheelUse[useKey] || 0) + 1 }); persist();
  W.spinning = true; W.msg = W.spins >= 1 ? KALOU_RESPIN[Math.min(W.spins - 1, 2)] : null; W.result = null; U.open = null;
  render();
  const disc = document.getElementById('wheel-disc');
  const segAt = (deg) => { const a = ((360 - (deg % 360)) % 360 + 360) % 360; let i = 0; while (i < starts.length - 1 && a >= starts[i + 1]) i++; return i; };
  let last = segAt(from); const t0 = performance.now();
  const ease = (t) => 1 - Math.pow(1 - t, 4);
  sfx.swoosh();
  const frame = (tNow) => {
    const t = Math.min(1, (tNow - t0) / T), deg = from + (to - from) * ease(t);
    if (disc) disc.style.transform = `rotate(${deg}deg)`;
    const seg = segAt(deg); if (seg !== last) { last = seg; sfx.tick(); if (navigator.vibrate && t < 0.9) navigator.vibrate(4); }
    if (t < 1) requestAnimationFrame(frame);
    else { W.rot = to % 360; W.spinning = false; W.spins++; W.result = items[idx]; sfx.success(); render(); }
  };
  requestAnimationFrame(frame);
}

async function redeem() {
  const code = U.code.trim();
  if (code.length < 4) { sfx.error(); toast('Ce code semble trop court.'); return; }
  if (!navigator.onLine) { toast('Connexion internet nécessaire.'); return; }
  try {
    await flush(S, api); const r = await api.redeemCode(code);
    if (r && r.ok) { S.orgName = r.org; persist(); U.showCode = false; render(); sfx.success(); toast('Code validé : ' + r.org + '.'); }
    else { sfx.error(); toast(r && r.error === 'exhausted' ? 'Ce code a atteint sa limite.' : 'Code inconnu. Vérifie avec ton organisme.'); }
  } catch (e) { toast('Connexion instable. Réessaie.'); }
}

/* ---------- Évènements ---------- */
root.addEventListener('click', (e) => {
  sfx.unlock();
  const el = e.target.closest('[data-act]'); if (!el || !root.contains(el)) return;
  const act = el.dataset.act;
  if (el.getAttribute('aria-disabled') === 'true' && !['setupNext', 'startTrial', 'notifyMe', 'spin'].includes(act)) return;
  const fn = ACT[act]; if (!fn) return;
  e.preventDefault();
  fn(el.dataset.arg);
});
root.addEventListener('input', (e) => {
  const el = e.target, k = el.dataset && el.dataset.input; if (!k) return;
  if (k === 'name') { U.draft.name = el.value; el.classList.toggle('ok', !!el.value.trim()); const b = document.getElementById('setup-cta'); if (b) b.setAttribute('aria-disabled', el.value.trim() ? 'false' : 'true'); }
  else if (k === 'weight' || k === 'height') U.draft[k] = el.value;
  else if (k === 'chatDraft') U.chatDraft = el.value;
  else if (k === 'code') U.code = el.value.toUpperCase();
  else if (k === 'licKey') U.licKey = el.value;
  else if (k === 'phone') {
    const len = (countryOf() || { len: 8 }).len || 8;
    el.value = el.value.replace(/[^\d ]/g, '').slice(0, len + 4); U.phone = el.value;
    const d = U.phone.replace(/\D/g, ''), ok = d.length === len;
    el.parentElement.className = 'phone ' + (d.length === 0 ? '' : ok ? 'ok' : 'warn');
    const h = document.getElementById('phone-hint'); if (h) h.textContent = d.length === 0 ? len + ' chiffres. Aucun paiement maintenant.' : ok ? 'Numéro valide.' : d.length < len ? 'Encore ' + (len - d.length) + ' chiffre(s).' : 'Trop de chiffres (' + len + ' attendus).';
    const b = document.getElementById('trial-cta'); if (b) b.setAttribute('aria-disabled', ok ? 'false' : 'true');
  }
});
// La roue : on peut aussi la lancer d'un geste (glisser) ou en touchant le disque
let flick = null;
root.addEventListener('pointerdown', (e) => { if (e.target.closest('.wheel-svg')) flick = { x: e.clientX, y: e.clientY, t: performance.now() }; });
root.addEventListener('pointerup', (e) => {
  if (!flick) return; const f = flick; flick = null;
  if (!e.target.closest('.wheel-box')) return;
  sfx.unlock(); spinWheel();
});
root.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.id === 'f-name') { e.preventDefault(); ACT.setupNext(); } });
root.addEventListener('submit', (e) => { const f = e.target.dataset.form; if (!f) return; e.preventDefault(); if (f === 'chat') ask(U.chatDraft); if (f === 'code') redeem(); if (f === 'lic') ACT.activateKey(); });
window.addEventListener('online', () => sync());
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; if (U.screen === 'profile') render(); });
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (S.onboarded && S.profile.assessedAt && VIEWS[h] && !['onb', 'setup'].includes(h) && h !== U.screen) go(h); });

/* ---------- Rappels au moment idéal ---------- */
const fired = new Set();
function reminders() {
  if (!S.onboarded || !S.profile.assessedAt) return;
  const n = now(), hm = hhmm(n), today = dayKey(n);
  const notify = (id, text) => {
    const tag = today + id; if (fired.has(tag)) return; fired.add(tag);
    if ('Notification' in window && Notification.permission === 'granted' && document.visibilityState !== 'visible') {
      navigator.serviceWorker?.getRegistration().then((r) => (r ? r.showNotification('Mon Assiette', { body: text, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', tag: id }) : new Notification('Mon Assiette', { body: text })));
    } else { toast(text); sfx.receive(); }
  };
  if (S.profile.notif.meals) {
    for (const [slot, time] of Object.entries(CONFIG.reminders)) {
      if (hm === time && !(S.meals[today] || {})[slot]) { const m = computed().day(0).find((x) => x.slot === slot); if (m) notify(slot, `C'est le moment idéal : ${m.name}. ${m.reasons[0] ? cap(m.reasons[0]) + '.' : ''}`); }
    }
  }
  const goal = analysis().glasses;
  if (S.profile.notif.water && n.getMinutes() === 0 && n.getHours() >= 9 && n.getHours() <= 19 && n.getHours() % 2 === 1 && (S.water[today] || 0) < goal) notify('water' + n.getHours(), `Un verre d'eau ? Tu en es à ${S.water[today] || 0}/${goal}.`);
  if (S.profile.notif.tips && hm === '08:00') notify('tip', computed().tip());
}
setInterval(reminders, 30000);

/* ---------- Paiement PayDunya ---------- */
async function payCheck() {
  if (!navigator.onLine) return;
  try {
    const ping = await api.pay({ action: 'ping' });
    U.payReady = !!ping.configured; U.payMode = ping.mode || null;
  } catch (e) { U.payReady = false; }
  // Abonnement payé enregistré sur le serveur (utile après un changement de téléphone ou un paiement terminé ailleurs)
  try {
    const p = await api.getProfile();
    if (p && p.plus_until) { S.plus = { plan: p.plus_plan, until: p.plus_until }; persist(); }
  } catch (e) { /* hors ligne */ }
  const pend = S.pendingPay;
  if (pend && U.payReady) {
    try {
      const r = await api.pay({ action: 'status', token: pend.token });
      if (r.ok && r.status === 'completed') {
        S.plus = { plan: r.plan, until: r.until }; S.pendingPay = null; persist();
        go('home'); celebrate(true); toast('Paiement reçu ! Mon Assiette Plus est actif jusqu’au ' + new Date(r.until).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) + '.');
      } else if (r.ok && (r.status === 'cancelled' || r.status === 'failed')) {
        S.pendingPay = null; persist(); sfx.error(); toast(r.status === 'cancelled' ? 'Paiement annulé. Tu n’as rien payé.' : 'Le paiement n’a pas abouti. Tu n’as rien payé.');
      } else if (Date.now() - pend.at > 86400000) { S.pendingPay = null; persist(); }
      else toast('Paiement en cours de confirmation…');
    } catch (e) { /* on réessaiera au prochain lancement */ }
  }
  if (/[?&]pay=cancel/.test(location.search) && !pend) toast('Paiement annulé. Tu n’as rien payé.');
  if (location.search) history.replaceState(null, '', location.pathname + location.hash);
  render();
}
async function payNow() {
  if (U.paying) return;
  if (!navigator.onLine) { sfx.error(); toast('Connexion internet nécessaire pour payer.'); return; }
  U.paying = true; render();
  try {
    await flush(S, api);
    const r = await api.pay({ action: 'create', plan: U.offerPlan });
    if (r.ok && r.url) {
      S.pendingPay = { token: r.token, plan: U.offerPlan, at: Date.now() }; persist();
      sfx.success(); location.href = r.url; return;
    }
    sfx.error(); toast(r.error === 'too_many' ? 'Trop de tentatives. Réessaie dans une heure.' : r.error === 'not_configured' ? 'Le paiement arrive très bientôt.' : 'Impossible de lancer le paiement. Réessaie.');
  } catch (e) { sfx.error(); toast('Connexion instable. Réessaie dans un instant.'); }
  U.paying = false; render();
}

/* ---------- Démarrage ---------- */
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
const h0 = location.hash.slice(1);
if (S.onboarded && S.profile.assessedAt && VIEWS[h0] && !['onb', 'setup'].includes(h0)) U.screen = h0;
render(false);
sync();
payCheck();
setInterval(() => { if (TAB_SCREENS.includes(U.screen) && !U.wheel.spinning) render(); }, 60000);
setInterval(() => { const el = document.getElementById('wheel-count'); if (el) { const t = untilMidnight(); el.textContent = t; if (t === '00:00:00' || t.startsWith('23:59:5')) render(); } }, 1000);
if (S.trial && !S.trial.cancelledAt && navigator.onLine) {
  api.getProfile().then((p) => { if (p && p.trial_started_at) { S.trial = { plan: p.trial_plan, startedAt: p.trial_started_at, cancelledAt: p.trial_cancelled_at }; persist(); render(); } }).catch(() => {});

}
