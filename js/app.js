import { SHARED_DEFS } from './art.js';
import { WEEK_PLAN, MEAL_KEYS, TIPS, DISHES, MARKET, CHAT_RULES, CHAT_FALLBACK, CHAT_CHIPS } from './content.js';
import { CONFIG } from './config.js';
import { load, save, wipe, fresh, enqueue, flush } from './store.js';
import { makeApi } from './api.js';
import * as V from './views.js';

/* ---------- État ---------- */
let S = load();
let api = makeApi(S.deviceId);
const U = {
  screen: S.onboarded ? 'home' : 'onb',
  enter: true,
  onbStep: 0,
  setupStep: 0,
  editing: false,
  loading: false,
  draft: null,
  planOffset: 0,
  planFilter: 'Tout',
  dish: 'rizgras',
  checked: {},
  saved: false,
  budget: S.profile.budget,
  chatDraft: '',
  typing: false,
  offerPlan: (S.trial && S.trial.plan) || 'mois',
  pay: S.pay.method || 'orange',
  phone: S.pay.phone || '',
  showCode: false,
  code: '',
  info: null
};
let installEvt = null;

/* ---------- Dates ---------- */
const pad = (n) => String(n).padStart(2, '0');
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function dateAt(off) { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + off); return d; }
function planIndex(d) { return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000) % 7; }
const nowHM = () => { const d = new Date(); return d.getHours() + ':' + pad(d.getMinutes()); };

/* ---------- Valeurs calculées ---------- */
function computed() {
  const t = S.trial;
  const end = t ? new Date(t.startedAt).getTime() + CONFIG.trialHours * 3600000 : 0;
  const isPlus = !!(t && !t.cancelledAt && Date.now() < end);
  return {
    isPlus,
    hoursLeft: isPlus ? Math.max(1, Math.ceil((end - Date.now()) / 3600000)) : 0,
    trialUsed: !!(t && (t.cancelledAt || Date.now() >= end)),
    orgName: S.orgName || null,
    canInstall: !!installEvt,
    dateAt,
    mealsFor(off) {
      const d = dateAt(off);
      const k = dayKey(d);
      const logs = S.meals[k] || {};
      return WEEK_PLAN[planIndex(d)].map((r, i) => ({ key: MEAL_KEYS[i], slot: r[0], time: r[1], name: r[2], sub: r[3], icon: r[4], takenAt: logs[MEAL_KEYS[i]] || null }));
    },
    waterToday() { return S.water[dayKey(new Date())] || 0; },
    score(taken, water) { return Math.round(((taken / 4) * 0.7 + (Math.min(8, water) / 8) * 0.3) * 100); },
    improvesThisWeek() { const lim = Date.now() - 7 * 86400000; return S.improvements.filter((x) => new Date(x.at).getTime() > lim).length; }
  };
}

/* ---------- Rendu ---------- */
const root = document.getElementById('app');
const scroller = () => root.querySelector('.scroll');

function render(keepScroll = true) {
  const C = computed();
  const prev = scroller();
  const top = keepScroll && !U.enter && prev ? prev.scrollTop : 0;
  const view = { onb: V.onboarding, setup: V.setup, home: V.home, plan: V.plan, improve: V.improve, market: V.market, chat: V.chat, profile: V.profile, offers: V.offers }[U.screen];
  const tabs = ['home', 'plan', 'improve', 'market', 'profile'].includes(U.screen);
  root.className = 'app' + (U.enter ? ' enter' : '');
  root.innerHTML = SHARED_DEFS + `<main class="scroll ${tabs ? 'has-tabs' : ''}" id="main">${view(S, U, C)}</main>` + (tabs ? V.tabbar(U.screen) : '');
  const sc = scroller();
  if (sc) sc.scrollTop = top;
  if (U.screen === 'chat') { const l = document.getElementById('chat-list'); if (l) l.scrollTop = l.scrollHeight; }
  U.enter = false;
}

function go(screen) {
  U.screen = screen;
  U.enter = true;
  U.info = null;
  if (screen === 'improve') { U.saved = false; }
  if (screen === 'market') U.budget = S.profile.budget;
  history.replaceState(null, '', screen === 'home' ? '/' : '#' + screen);
  render(false);
  const main = document.getElementById('main');
  if (main) main.focus({ preventScroll: true });
}

function persist() { save(S); }
function sync() { flush(S, api); }

/* ---------- Toast et confettis ---------- */
let toastT;
function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.innerHTML = `<i>✓</i><span></span>`;
  el.querySelector('span').textContent = msg;
  el.className = 'toast show';
  clearTimeout(toastT);
  toastT = setTimeout(() => { el.className = 'toast'; }, 2800);
}
function celebrate() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = document.createElement('div');
  box.className = 'confetti';
  const colors = ['#F59E0B', '#2F8F4E', '#F05A3C', '#2563EB', '#FFD25A', '#7CCB6E', '#FF8A3D'];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2; const r = 110 + (i % 4) * 35;
    const s = document.createElement('span');
    s.style.cssText = `background:${colors[i % colors.length]};--x:${Math.round(Math.cos(a) * r)}px;--y:${Math.round(Math.sin(a) * r)}px;animation-delay:${(i % 3) * 0.05}s`;
    box.appendChild(s);
  }
  document.body.appendChild(box);
  if (navigator.vibrate) navigator.vibrate(30);
  setTimeout(() => box.remove(), 1600);
}

/* ---------- Kalou (chat) ---------- */
function kalouReply(text) {
  const t = text.toLowerCase();
  for (const [keys, answer] of CHAT_RULES) {
    if (keys.some((k) => t.includes(k))) return answer.replace('{name}', S.profile.name);
  }
  return CHAT_FALLBACK;
}
function ask(text) {
  const q = (text || '').trim();
  if (!q || U.typing) return;
  if (!S.chat.length) S.chat.push({ from: 'kalou', text: 'Salut ' + S.profile.name + " ! Je suis Kalou. Pose-moi une question sur tes repas, ou touche une suggestion en bas." });
  S.chat.push({ from: 'me', text: q });
  S.chat = S.chat.slice(-60);
  U.chatDraft = '';
  U.typing = true;
  enqueue(S, { t: 'question', text: q, expert: false });
  persist(); render(); sync();
  setTimeout(() => {
    S.chat.push({ from: 'kalou', text: kalouReply(q) });
    U.typing = false;
    persist();
    if (U.screen === 'chat') render();
  }, 900);
}

/* ---------- Actions ---------- */
const A = {
  go: (a) => go(a),
  // Bienvenue
  onbNext() { if (U.onbStep < 2) { U.onbStep++; U.enter = true; render(false); } else A.onbSkip(); },
  onbPrev() { U.onbStep = Math.max(0, U.onbStep - 1); U.enter = true; render(false); },
  onbGo(a) { U.onbStep = +a; U.enter = true; render(false); },
  onbSkip() { U.draft = Object.assign({}, S.profile); U.setupStep = 0; U.editing = false; go('setup'); },
  // Questionnaire
  setGoal(a) { U.draft.goal = a; render(); },
  setHouse(a) { U.draft.household = a; render(); },
  toggleKids() { U.draft.kids = !U.draft.kids; render(); },
  setBudget(a) { U.draft.budget = +a; render(); },
  setLang(a) { U.draft.lang = a; render(); },
  setupBack() {
    if (U.setupStep > 0) { U.setupStep--; U.enter = true; render(false); }
    else go(U.editing ? 'profile' : 'onb');
  },
  setupNext() {
    if (U.setupStep === 0 && !U.draft.name.trim()) { const f = document.getElementById('f-name'); if (f) f.focus(); return; }
    if (U.setupStep < 3) { U.setupStep++; U.enter = true; render(false); return; }
    U.draft.name = U.draft.name.trim().slice(0, 40);
    const wasEditing = U.editing;
    S.profile = Object.assign({}, S.profile, U.draft);
    enqueue(S, { t: 'profile' });
    if (wasEditing) { U.editing = false; persist(); sync(); go('profile'); toast('Profil mis à jour.'); return; }
    U.loading = true; render(false);
    setTimeout(() => {
      S.onboarded = true; U.loading = false; U.budget = S.profile.budget;
      persist(); sync();
      go('home');
      toast('Bienvenue ' + S.profile.name + ' ! Ton plan est prêt.');
      celebrate();
    }, 1900);
  },
  editProfile() { U.draft = Object.assign({}, S.profile); U.setupStep = 0; U.editing = true; go('setup'); },
  // Repas et eau
  toggleMeal(key) {
    const k = dayKey(new Date());
    const logs = Object.assign({}, S.meals[k] || {});
    if (logs[key]) { delete logs[key]; enqueue(S, { t: 'unmeal', day: k, key }); }
    else {
      logs[key] = nowHM();
      enqueue(S, { t: 'meal', day: k, key, at: new Date().toISOString() });
      const all = MEAL_KEYS.every((m) => logs[m]);
      celebrate(); toast(all ? 'Journée parfaite ! Tous tes repas sont notés.' : 'Bien joué ! Repas noté.');
    }
    S.meals[k] = logs;
    persist(); render(); sync();
  },
  waterPlus() {
    const k = dayKey(new Date()); const w = Math.min(8, (S.water[k] || 0) + 1);
    const before = S.water[k] || 0;
    S.water[k] = w; enqueue(S, { t: 'water', day: k, glasses: w });
    if (w === 8 && before < 8) { celebrate(); toast('Objectif eau atteint : 8 verres !'); }
    persist(); render(); sync();
  },
  waterMinus() {
    const k = dayKey(new Date()); const w = Math.max(0, (S.water[k] || 0) - 1);
    S.water[k] = w; enqueue(S, { t: 'water', day: k, glasses: w }); persist(); render(); sync();
  },
  nextTip() { S.tip = (S.tip + 1) % TIPS.length; persist(); render(); },
  speak() {
    if (!('speechSynthesis' in window)) { toast("La lecture audio n'est pas disponible sur ce téléphone."); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(TIPS[S.tip % TIPS.length]);
    u.lang = 'fr-FR'; u.rate = 0.95;
    speechSynthesis.speak(u);
  },
  bell() {
    const next = computed().mealsFor(0).find((m) => !m.takenAt);
    toast(S.profile.notif.meals ? (next ? 'Prochain repas : ' + next.name + ' à ' + next.time + '.' : 'Tous tes repas du jour sont notés.') : 'Rappels repas désactivés. Active-les dans ton profil.');
  },
  // Plan
  planDay(a) { U.planOffset = +a; render(); },
  planFilter(a) { U.planFilter = a; render(); },
  planInfo() { toast(U.planOffset < 0 ? 'Ce jour est passé.' : 'Tu pourras cocher ce repas le jour venu.'); },
  // Améliorer
  pickDish(a) { U.dish = a; U.checked = {}; U.saved = false; render(); },
  toggleTip(a) { U.checked = Object.assign({}, U.checked, { [a]: !U.checked[a] }); U.saved = false; render(); },
  saveImprove() {
    const C = computed();
    if (!C.isPlus && C.improvesThisWeek() >= CONFIG.freeImprovesPerWeek) { go('offers'); return; }
    const dish = DISHES.find((d) => d.id === U.dish);
    const tips = dish.tips.filter((_, i) => U.checked[i]);
    if (!tips.length) { toast("Coche au moins un conseil avant d'enregistrer."); return; }
    const score = Math.min(100, dish.base + tips.reduce((s, t) => s + t.pts, 0));
    S.improvements.push({ dish: dish.name, score, at: new Date().toISOString() });
    S.improvements = S.improvements.slice(-50);
    enqueue(S, { t: 'improve', dish: dish.name, score, tips: tips.map((t) => t.t) });
    U.saved = true; persist(); render(); sync();
    celebrate(); toast(dish.name + ' amélioré : ' + score + '/100.');
  },
  // Marché
  setMarketBudget(a) { U.budget = +a; render(); },
  toggleItem(key) {
    S.bought[key] = !S.bought[key];
    const b = key.split('-')[0]; const items = MARKET[b].items;
    if (S.bought[key] && items.every((_, i) => S.bought[b + '-' + i])) { celebrate(); toast('Liste terminée ! Bon appétit.'); }
    persist(); render();
  },
  clearList(b) { MARKET[b].items.forEach((_, i) => { delete S.bought[b + '-' + i]; }); persist(); render(); },
  async shareList() {
    const m = MARKET[U.budget];
    const text = 'Ma liste de courses Mon Assiette :\n' + m.items.map((i) => '• ' + i[0] + ' (' + i[1] + ')').join('\n') + '\n\n' + location.origin;
    if (navigator.share) { try { await navigator.share({ title: 'Ma liste de courses', text }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
  },
  weekMenu() { const C = computed(); if (C.isPlus) { go('plan'); toast('Ton menu de 7 jours est dans ton plan repas.'); } else go('offers'); },
  // Chat
  ask(i) { ask(CHAT_CHIPS[+i]); },
  expert() {
    const C = computed();
    if (!C.isPlus) { go('offers'); return; }
    const last = [...S.chat].reverse().find((m) => m.from === 'me');
    if (!last) { toast("Écris d'abord ta question, puis touche « Nutritionniste »."); return; }
    enqueue(S, { t: 'question', text: last.text, expert: true }); persist(); sync();
    toast('Question envoyée à une nutritionniste. Réponse sous 48 h.');
  },
  // Profil
  toggleNotif(key) {
    const on = !S.profile.notif[key];
    S.profile.notif = Object.assign({}, S.profile.notif, { [key]: on });
    enqueue(S, { t: 'profile' }); persist(); render(); sync();
    if (on && 'Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    toast(on ? 'Rappel activé.' : 'Rappel désactivé.');
  },
  info(a) { U.info = U.info === a ? null : a; render(); },
  async install() { if (!installEvt) return; installEvt.prompt(); await installEvt.userChoice; installEvt = null; render(); },
  wipe() {
    if (!confirm('Effacer toutes tes données de ce téléphone et recommencer ?')) return;
    wipe(); S = fresh(); api = makeApi(S.deviceId); persist();
    Object.assign(U, { onbStep: 0, setupStep: 0, chatDraft: '', checked: {}, offerPlan: 'mois', phone: '', code: '' });
    go('onb');
  },
  // Offres
  pickPlan(a) { U.offerPlan = a; render(); },
  pickPay(a) { U.pay = a; render(); },
  toggleCode() { U.showCode = !U.showCode; render(); },
  async startTrial() {
    const digits = U.phone.replace(/\D/g, '');
    if (U.pay !== 'card' && digits.length !== 8) { toast('Entre ton numéro Mobile Money (8 chiffres).'); document.getElementById('pay-phone')?.focus(); return; }
    if (!navigator.onLine) { toast("Connexion internet nécessaire pour activer l'essai."); return; }
    S.pay = { method: U.pay, phone: U.pay === 'card' ? '' : digits };
    try {
      await flush(S, api);
      const r = await api.startTrial(U.offerPlan);
      if (!r || !r.ok) { toast(r && r.error === 'trial_used' ? "Tu as déjà utilisé ton essai gratuit sur ce téléphone." : "Impossible d'activer l'essai pour le moment."); return; }
      S.trial = { plan: r.plan, startedAt: r.started_at, cancelledAt: null };
      enqueue(S, { t: 'pay', method: S.pay.method, phone: S.pay.phone });
      persist(); sync();
      go('home'); celebrate(); toast('Essai Plus activé : 72 h offertes, sans engagement.');
    } catch (e) { toast('Connexion instable. Réessaie dans un instant.'); }
  },
  async cancelTrial() {
    if (!confirm("Arrêter ton essai Plus ? Tu ne paieras rien.")) return;
    try { await api.cancelTrial(); } catch (e) { /* on arrête localement quand même */ }
    if (S.trial) S.trial.cancelledAt = new Date().toISOString();
    persist(); render(); toast("Essai arrêté. Tu ne paieras rien.");
  },
  notifyMe() {
    S.pay = { method: U.pay, phone: U.phone.replace(/\D/g, '') };
    enqueue(S, { t: 'pay', method: S.pay.method, phone: S.pay.phone }); persist(); sync();
    toast("C'est noté ! On te prévient dès que le paiement est ouvert.");
  },
  async invite() {
    const text = 'Je mange mieux avec Mon Assiette et Kalou. Essaie toi aussi : ' + location.origin;
    if (navigator.share) { try { await navigator.share({ title: 'Mon Assiette', text }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
  }
};

async function redeem() {
  const code = U.code.trim();
  if (code.length < 4) { toast('Ce code semble trop court.'); return; }
  if (!navigator.onLine) { toast('Connexion internet nécessaire.'); return; }
  try {
    await flush(S, api);
    const r = await api.redeemCode(code);
    if (r && r.ok) { S.orgName = r.org; persist(); U.showCode = false; render(); toast('Code validé : ' + r.org + '.'); }
    else toast(r && r.error === 'exhausted' ? 'Ce code a atteint sa limite.' : 'Code inconnu. Vérifie avec ton organisme.');
  } catch (e) { toast('Connexion instable. Réessaie.'); }
}

/* ---------- Évènements ---------- */
root.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || !root.contains(el)) return;
  if (el.getAttribute('aria-disabled') === 'true' && el.dataset.act !== 'setupNext' && el.dataset.act !== 'startTrial' && el.dataset.act !== 'notifyMe') return;
  const fn = A[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el.dataset.arg); }
});

root.addEventListener('input', (e) => {
  const el = e.target;
  const k = el.dataset && el.dataset.input;
  if (!k) return;
  if (k === 'name') {
    U.draft.name = el.value;
    el.classList.toggle('ok', !!el.value.trim());
    const b = document.getElementById('setup-cta'); if (b) b.setAttribute('aria-disabled', el.value.trim() ? 'false' : 'true');
  } else if (k === 'chatDraft') U.chatDraft = el.value;
  else if (k === 'code') U.code = el.value.toUpperCase();
  else if (k === 'phone') {
    el.value = el.value.replace(/[^\d ]/g, '').slice(0, 11);
    U.phone = el.value;
    const d = U.phone.replace(/\D/g, '');
    const ok = d.length === 8;
    el.parentElement.className = 'phone ' + (d.length === 0 ? '' : ok ? 'ok' : 'warn');
    const h = document.getElementById('phone-hint');
    if (h) h.textContent = d.length === 0 ? '8 chiffres. Aucun paiement maintenant.' : ok ? 'Numéro valide.' : 'Encore ' + (8 - d.length) + ' chiffre(s).';
    const b = document.getElementById('trial-cta'); if (b) b.setAttribute('aria-disabled', ok ? 'false' : 'true');
  }
});

root.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.id === 'f-name') { e.preventDefault(); A.setupNext(); }
});

root.addEventListener('submit', (e) => {
  const f = e.target.dataset.form;
  if (!f) return;
  e.preventDefault();
  if (f === 'chat') ask(U.chatDraft);
  if (f === 'code') redeem();
});

window.addEventListener('online', () => { sync(); });
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; if (U.screen === 'profile') render(); });
window.addEventListener('hashchange', () => {
  const h = location.hash.slice(1);
  if (S.onboarded && ['home', 'plan', 'improve', 'market', 'chat', 'profile', 'offers'].includes(h) && h !== U.screen) go(h);
});

/* ---------- Rappels (quand l'app est ouverte ou installée) ---------- */
const fired = new Set();
function reminders() {
  if (!S.onboarded) return;
  const n = new Date();
  const hm = pad(n.getHours()) + ':' + pad(n.getMinutes());
  const today = dayKey(n);
  const notify = (id, text) => {
    const tag = today + id; if (fired.has(tag)) return; fired.add(tag);
    if ('Notification' in window && Notification.permission === 'granted' && document.visibilityState !== 'visible') {
      navigator.serviceWorker?.getRegistration().then((r) => r ? r.showNotification('Mon Assiette', { body: text, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', tag: id }) : new Notification('Mon Assiette', { body: text }));
    } else toast(text);
  };
  if (S.profile.notif.meals) {
    for (const [slot, time] of Object.entries(CONFIG.reminders)) {
      if (hm === time && !(S.meals[today] || {})[slot]) notify(slot, 'Kalou te rappelle ton repas : ' + computed().mealsFor(0).find((m) => m.key === slot).name + '.');
    }
  }
  if (S.profile.notif.water && n.getMinutes() === 0 && n.getHours() >= 9 && n.getHours() <= 19 && n.getHours() % 2 === 1 && (S.water[today] || 0) < 8) notify('water' + n.getHours(), "Un verre d'eau ? Tu en es à " + (S.water[today] || 0) + '/8.');
  if (S.profile.notif.tips && hm === '08:00') notify('tip', TIPS[S.tip % TIPS.length]);
}
setInterval(reminders, 30000);

/* ---------- Démarrage ---------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
const h = location.hash.slice(1);
if (S.onboarded && ['plan', 'improve', 'market', 'chat', 'profile', 'offers'].includes(h)) U.screen = h;
if (U.screen === 'setup' && !U.draft) U.draft = Object.assign({}, S.profile);
render(false);
sync();
setInterval(() => { if (computed().isPlus) render(); }, 15 * 60000);
// Rafraîchit l'en-tête de Plus et l'état de l'essai
if (S.trial && !S.trial.cancelledAt && navigator.onLine) {
  api.getProfile().then((p) => {
    if (p && p.trial_started_at) { S.trial = { plan: p.trial_plan, startedAt: p.trial_started_at, cancelledAt: p.trial_cancelled_at }; persist(); render(); }
  }).catch(() => {});
}
