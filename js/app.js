import { SHARED_DEFS } from './art.js';
import { SLOT_ORDER, MAIN_SLOTS, SLOT_INFO, NUTRIENTS, TAG_BENEFIT, DISHES, CHAT_CHIPS, DAY_THEMES, PAYMENTS, APPETITE_TIPS } from './content.js';
import { assess, planDay, missionFor, tipsFor, shopping, cookWith, slotNow } from './engine.js';
import { CONFIG } from './config.js';
import { load, save, wipe, fresh, enqueue, flush } from './store.js';
import { makeApi } from './api.js';
import { sfx } from './sfx.js';
import * as V from './views.js';

/* ---------- État ---------- */
let S = load();
let api = makeApi(S.deviceId);
sfx.setEnabled(S.sound);
const needsBilan = S.onboarded && !S.profile.assessedAt;
const U = {
  screen: S.onboarded ? (needsBilan ? 'setup' : 'home') : 'onb',
  enter: true, onbStep: 0, setupStep: 0, editing: needsBilan, loading: false,
  draft: needsBilan ? clone(S.profile) : null, firstBilan: false,
  planOffset: 0, open: null, nutOpen: false,
  cookTab: 'have', have: [], dish: 'rizgras', checked: {},
  chatDraft: '', typing: false,
  offerPlan: (S.trial && S.trial.plan) || 'mois', pay: S.pay.method || 'orange', phone: S.pay.phone || '',
  showCode: false, code: '', info: null
};
let installEvt = null;
function clone(o) { return JSON.parse(JSON.stringify(o)); }

/* ---------- Dates ---------- */
const pad = (n) => String(n).padStart(2, '0');
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function dateAt(off) { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + off); return d; }
const nowHM = () => { const d = new Date(); return d.getHours() + ':' + pad(d.getMinutes()); };
function weekKey(d = new Date()) { const x = new Date(d); x.setDate(x.getDate() - (x.getDay() + 6) % 7); return dayKey(x); }
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
  let n = 0; const d = new Date();
  if (!active(dayKey(d))) d.setDate(d.getDate() - 1);
  while (active(dayKey(d)) && n < 999) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function computed() {
  const A = analysis();
  const t = S.trial;
  const end = t ? new Date(t.startedAt).getTime() + CONFIG.trialHours * 3600000 : 0;
  const isPlus = !!(t && !t.cancelledAt && Date.now() < end);
  const dayCache = {};
  const day = (off) => {
    if (dayCache[off]) return dayCache[off];
    const d = dateAt(off), k = dayKey(d), logs = S.meals[k] || {};
    return (dayCache[off] = planDay(d, S.profile, A, S.swaps, k).map((m) => Object.assign({}, m, { takenAt: logs[m.slot] || null })));
  };
  return {
    A, isPlus, dateAt, day,
    hoursLeft: isPlus ? Math.max(1, Math.ceil((end - Date.now()) / 3600000)) : 0,
    trialUsed: !!(t && (t.cancelledAt || Date.now() >= end)),
    orgName: S.orgName || null,
    canInstall: !!installEvt,
    hasAppetite: A.priorities.concat(A.watch).some((x) => x.id === 'appetit'),
    theme: (off) => DAY_THEMES[dateAt(off).getDay()],
    waterToday: () => S.water[dayKey(new Date())] || 0,
    improvesThisWeek() { const lim = Date.now() - 7 * 86400000; return S.improvements.filter((x) => new Date(x.at).getTime() > lim).length; },
    cookWith: (have) => cookWith(have, S.profile, A),
    shopping: (n) => shopping([...Array(n)].map((_, i) => day(i))),
    tip() { const list = tipsFor(A); return list[S.tip % list.length].t; },
    streak: streak(),
    heroMeal() {
      const today = day(0), nowSlot = slotNow();
      const m = today.slice(SLOT_ORDER.indexOf(nowSlot)).find((x) => !x.takenAt) || null;
      if (!m) return null;
      const n = new Date(), mins = toMin(SLOT_INFO[m.slot].time) - (n.getHours() * 60 + n.getMinutes());
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
      return Object.assign({}, m, { done: rec.days.length, today: rec.days.includes(dayKey(new Date())) });
    }
  };
}

/* ---------- Rendu ---------- */
const root = document.getElementById('app');
const scroller = () => root.querySelector('.scroll');
const TAB_SCREENS = ['home', 'plan', 'cook', 'market', 'profile'];
const VIEWS = { onb: V.onboarding, setup: V.setup, bilan: V.bilan, home: V.home, plan: V.plan, cook: V.cook, market: V.market, chat: V.chat, profile: V.profile, offers: V.offers };
function render(keepScroll = true) {
  const C = computed(), prev = scroller();
  const top = keepScroll && !U.enter && prev ? prev.scrollTop : 0;
  const tabs = TAB_SCREENS.includes(U.screen);
  root.className = 'app' + (U.enter ? ' enter' : '');
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
  go: (a) => go(a),
  onbNext() { sfx.tap(); if (U.onbStep < 2) { U.onbStep++; U.enter = true; render(false); } else ACT.onbSkip(); },
  onbPrev() { sfx.tap(); U.onbStep = Math.max(0, U.onbStep - 1); U.enter = true; render(false); },
  onbGo(a) { sfx.tap(); U.onbStep = +a; U.enter = true; render(false); },
  onbSkip() { U.draft = clone(S.profile); U.setupStep = 0; U.editing = false; go('setup'); },
  setSex(a) { U.draft.sex = a; if (a === 'm') U.draft.pregnancy = 'non'; sfx.tick(); render(); },
  setAge(a) { setD('age', a); },
  setActivity(a) { setD('activity', a); },
  setGoal(a) { setD('goal', a); },
  toggleCond(a) { setD('conditions', toggleIn(U.draft.conditions, a)); },
  noCond() { setD('conditions', []); },
  setPreg(a) { setD('pregnancy', a); },
  toggleAllergy(a) { setD('allergies', toggleIn(U.draft.allergies, a)); },
  noAllergy() { setD('allergies', []); },
  setDiet(a) { setD('diet', a); },
  setHabit(a) { const [k, v] = a.split(':'); U.draft.habits = Object.assign({}, U.draft.habits, { [k]: v }); sfx.tick(); render(); },
  setupBack() { sfx.tap(); if (U.setupStep > 0) { U.setupStep--; U.enter = true; render(false); } else go(U.editing && S.profile.assessedAt ? 'profile' : 'onb'); },
  setupNext() {
    const d = U.draft, st = U.setupStep;
    if ((st === 0 && !d.name.trim()) || (st === 1 && (!d.sex || !d.age))) { sfx.error(); toast(st === 0 ? 'Écris ton prénom pour continuer.' : 'Choisis ton sexe et ton âge pour continuer.'); return; }
    sfx.tap();
    if (st < V.SETUP_STEPS - 1) { U.setupStep++; U.enter = true; render(false); return; }
    d.name = d.name.trim().slice(0, 40);
    d.weight = d.weight ? Number(d.weight) : null; d.height = d.height ? Number(d.height) : null;
    d.assessedAt = new Date().toISOString();
    const wasAssessed = !!S.profile.assessedAt;
    S.profile = Object.assign({}, S.profile, d);
    S.swaps = {}; enqueue(S, { t: 'profile' });
    U.loading = true; render(false);
    setTimeout(() => { S.onboarded = true; U.loading = false; U.editing = false; U.firstBilan = !wasAssessed; persist(); sync(); go('bilan'); celebrate(true); }, 2300);
  },
  bilanDone() { const first = U.firstBilan; U.firstBilan = false; go('home'); if (first) toast('Voici ta journée idéale, ' + S.profile.name + ' !'); },
  editProfile() { U.draft = clone(S.profile); U.setupStep = 0; U.editing = true; go('setup'); },
  eat(slot) {
    const k = dayKey(new Date()), logs = Object.assign({}, S.meals[k] || {});
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
      const today = dayKey(new Date());
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
    const k = dayKey(new Date()), goal = analysis().glasses, before = S.water[k] || 0, w = Math.min(goal + 4, before + 1);
    S.water[k] = w; enqueue(S, { t: 'water', day: k, glasses: w }); sfx.water();
    if (w === goal) { celebrate(true); toast("Objectif d'eau atteint : " + goal + ' verres !'); }
    persist(); render(); sync();
  },
  waterMinus() { const k = dayKey(new Date()), w = Math.max(0, (S.water[k] || 0) - 1); S.water[k] = w; enqueue(S, { t: 'water', day: k, glasses: w }); sfx.tap(); persist(); render(); sync(); },
  missionDone() {
    const m = computed().mission(), wk = weekKey(), today = dayKey(new Date());
    const rec = S.missions[wk] && S.missions[wk].id === m.id ? S.missions[wk] : { id: m.id, days: [] };
    if (!rec.days.includes(today)) rec.days.push(today);
    S.missions = { [wk]: rec }; persist();
    const done = rec.days.length >= m.goal; celebrate(done); render();
    toast(done ? 'Défi de la semaine réussi ! Bravo ' + S.profile.name + ' !' : `Défi validé pour aujourd'hui : ${rec.days.length}/${m.goal}.`);
  },
  nextTip() { S.tip = (S.tip + 1) % 99; sfx.tap(); persist(); render(); },
  speak() {
    if (!('speechSynthesis' in window)) { toast("La lecture audio n'est pas disponible sur ce téléphone."); return; }
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(computed().tip()); u.lang = 'fr-FR'; u.rate = 0.95; speechSynthesis.speak(u);
  },
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
    Object.assign(U, { onbStep: 0, setupStep: 0, chatDraft: '', checked: {}, have: [], offerPlan: 'mois', phone: '', code: '', editing: false });
    go('onb');
  },
  pickPlan(a) { U.offerPlan = a; sfx.tick(); render(); },
  pickPay(a) { U.pay = a; sfx.tick(); render(); },
  toggleCode() { U.showCode = !U.showCode; sfx.tap(); render(); },
  async startTrial() {
    const pay = PAYMENTS.find((x) => x.id === U.pay) || PAYMENTS[0];
    const digits = U.phone.replace(/\D/g, '');
    if (pay.phone && digits.length !== 8) { sfx.error(); toast('Entre ton numéro ' + pay.label + ' (8 chiffres).'); document.getElementById('pay-phone')?.focus(); return; }
    if (!navigator.onLine) { sfx.error(); toast("Connexion internet nécessaire pour activer l'essai."); return; }
    S.pay = { method: U.pay, phone: pay.phone ? digits : '' };
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
  notifyMe() { S.pay = { method: U.pay, phone: U.phone.replace(/\D/g, '') }; enqueue(S, { t: 'pay', method: S.pay.method, phone: S.pay.phone }); persist(); sync(); sfx.success(); toast("C'est noté ! On te prévient dès l'ouverture du paiement."); },
  async invite() {
    sfx.tap();
    const text = 'Je sais enfin quoi manger, et pourquoi, avec Mon Assiette et Kalou. Essaie : ' + location.origin;
    if (navigator.share) { try { await navigator.share({ title: 'Mon Assiette', text }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
  }
};

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
  if (el.getAttribute('aria-disabled') === 'true' && !['setupNext', 'startTrial', 'notifyMe'].includes(act)) return;
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
  else if (k === 'phone') {
    el.value = el.value.replace(/[^\d ]/g, '').slice(0, 11); U.phone = el.value;
    const d = U.phone.replace(/\D/g, ''), ok = d.length === 8;
    el.parentElement.className = 'phone ' + (d.length === 0 ? '' : ok ? 'ok' : 'warn');
    const h = document.getElementById('phone-hint'); if (h) h.textContent = d.length === 0 ? '8 chiffres. Aucun paiement maintenant.' : ok ? 'Numéro valide.' : 'Encore ' + (8 - d.length) + ' chiffre(s).';
    const b = document.getElementById('trial-cta'); if (b) b.setAttribute('aria-disabled', ok ? 'false' : 'true');
  }
});
root.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.id === 'f-name') { e.preventDefault(); ACT.setupNext(); } });
root.addEventListener('submit', (e) => { const f = e.target.dataset.form; if (!f) return; e.preventDefault(); if (f === 'chat') ask(U.chatDraft); if (f === 'code') redeem(); });
window.addEventListener('online', () => sync());
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; if (U.screen === 'profile') render(); });
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (S.onboarded && S.profile.assessedAt && VIEWS[h] && !['onb', 'setup'].includes(h) && h !== U.screen) go(h); });

/* ---------- Rappels au moment idéal ---------- */
const fired = new Set();
function reminders() {
  if (!S.onboarded || !S.profile.assessedAt) return;
  const n = new Date(), hm = pad(n.getHours()) + ':' + pad(n.getMinutes()), today = dayKey(n);
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

/* ---------- Démarrage ---------- */
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
const h0 = location.hash.slice(1);
if (S.onboarded && S.profile.assessedAt && VIEWS[h0] && !['onb', 'setup'].includes(h0)) U.screen = h0;
render(false);
sync();
setInterval(() => { if (TAB_SCREENS.includes(U.screen)) render(); }, 60000);
if (S.trial && !S.trial.cancelledAt && navigator.onLine) {
  api.getProfile().then((p) => { if (p && p.trial_started_at) { S.trial = { plan: p.trial_plan, startedAt: p.trial_started_at, cancelledAt: p.trial_cancelled_at }; persist(); render(); } }).catch(() => {});
}
