// Écrans de l'application. Chaque fonction renvoie du HTML ; les actions passent par data-act.

import { kalou, food, ICON3D, icon, BELL_FILLED } from './art.js';
import {
  SLIDES, QUESTIONS, GOALS, HOUSEHOLDS, BUDGETS, LANGS, TIPS, DISHES, MARKET, seasonFor,
  CHAT_CHIPS, PLANS, PLAN_NAMES, FEATURES
} from './content.js';

export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtF = (n) => n.toLocaleString('fr-FR').replace(/ | /g, ' ') + ' F';
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function header(title, opts = {}) {
  return `<header class="topbar fu d1">
    <button class="round" data-act="go" data-arg="${opts.back || 'home'}" aria-label="Retour">${icon('back', 22, '#141614', 1.8)}</button>
    <h1 class="title">${title}</h1>
    ${opts.right || '<span class="round-spacer"></span>'}
  </header>`;
}

function cta(label, act, opts = {}) {
  return `<button class="cta ${opts.cls || ''}" data-act="${act}" ${opts.arg != null ? `data-arg="${opts.arg}"` : ''} ${opts.disabled ? 'aria-disabled="true"' : ''} ${opts.id ? `id="${opts.id}"` : ''}>
    <span class="cta-dot ${opts.pulse ? 'pulse' : ''}">${icon(opts.icon || 'next', 20, '#0E0E0E', 2.2)}</span>
    <span class="cta-label">${label}${opts.sub ? `<small>${opts.sub}</small>` : ''}</span>
    ${opts.arrows ? `<span class="cta-arrows" aria-hidden="true"><i class="ar1">›</i><i class="ar2">›</i><i class="ar3">›</i></span>` : ''}
  </button>`;
}

function pill(text, kind) {
  return `<span class="pill pill-${kind}">${text}</span>`;
}

/* ---------------- Bienvenue ---------------- */
export function onboarding(S, U) {
  const step = U.onbStep;
  const s = SLIDES[step];
  const right = s.side === 'right';
  return `<section class="onb" aria-roledescription="carrousel">
    <picture class="onb-photo">
      <source srcset="${s.img}.webp" type="image/webp">
      <img class="kb" src="${s.img}.jpg" alt="${esc(s.alt)}" style="object-position:${s.pos}" fetchpriority="high">
    </picture>
    <div class="onb-shade"></div><div class="onb-vignette"></div>
    <div class="glow" aria-hidden="true"></div><div class="sweep" aria-hidden="true"></div>
    <div class="onb-top">
      ${step > 0 ? `<button class="glass round-sm" data-act="onbPrev" aria-label="Retour">${icon('prev', 20, '#fff', 2)}</button>` : `<span class="glass brand">Mon Assiette</span>`}
      <button class="glass chip-btn" data-act="onbSkip">Passer</button>
    </div>
    <div class="onb-panel rise">
      <span class="spark tw" style="top:22px;left:34px"></span><span class="spark tw2" style="top:60px;left:18px"></span><span class="spark tw3" style="top:120px;right:26px"></span>
      <div class="onb-kalou float" style="${right ? 'right:14px' : 'left:14px'}">${kalou(s.pose, 112)}</div>
      <div class="onb-bubble pop ${right ? 'br' : 'bl'}" style="${right ? 'right:130px' : 'left:130px'}">${esc(s.bubble)}</div>
      <h2 class="onb-title fu d2">${esc(s.title).replace('\n', '<br>')}</h2>
      <p class="onb-text fu d3">${esc(s.text)}</p>
      <div class="dots fu d4">${SLIDES.map((_, i) => `<button data-act="onbGo" data-arg="${i}" aria-label="Écran ${i + 1} sur 3"><span class="${i === step ? 'on' : ''}"></span></button>`).join('')}</div>
      ${cta(step < 2 ? 'Suivant' : 'Commencer', 'onbNext', { arrows: true, pulse: true, cls: 'fu d5' })}
    </div>
  </section>`;
}

/* ---------------- Questionnaire ---------------- */
function option(o, on, act) {
  return `<button class="opt tap ${on ? 'on' : ''}" data-act="${act}" data-arg="${o.id}" aria-pressed="${on}">
    <span class="opt-ico">${icon(o.icon, 22, on ? '#fff' : '#2C7546', 2)}</span>
    <span class="opt-txt"><b>${o.label}</b><small>${o.desc}</small></span>
    <span class="opt-radio">${icon('check', 12, '#fff', 3.4)}</span>
  </button>`;
}

export function setup(S, U) {
  const d = U.draft;
  const step = U.setupStep;
  if (U.loading) {
    const g = GOALS.find((x) => x.id === d.goal);
    const h = HOUSEHOLDS.find((x) => x.id === d.household);
    return `<section class="setup">
      <div class="loading-box">
        ${kalou('bravo', 170)}
        <h2>Kalou prépare ton plan…</h2>
        <p>Menus adaptés à ${esc((g ? g.label : '').toLowerCase())}, ${esc((h ? h.label : '').toLowerCase())}, ${fmtF(d.budget)} par jour.</p>
        <div class="loadbar"><div class="load"></div></div>
      </div>
    </section>`;
  }
  const q = QUESTIONS[step];
  const pose = step === 3 ? 'bravo' : (step % 2 ? 'clin' : 'joie');
  let body = '';
  if (step === 0) {
    body = `<label for="f-name" class="lbl">Ton prénom</label>
      <input id="f-name" class="field ${d.name.trim() ? 'ok' : ''}" type="text" value="${esc(d.name)}" placeholder="Ex. Aminata" autocomplete="given-name" maxlength="40" data-input="name" enterkeyhint="next">
      <small class="muted">Kalou l'utilise pour te parler. Rien d'autre.</small>`;
  } else if (step === 1) {
    body = GOALS.map((o) => option(o, o.id === d.goal, 'setGoal')).join('');
  } else if (step === 2) {
    body = HOUSEHOLDS.map((o) => option(o, o.id === d.household, 'setHouse')).join('') +
      `<button class="switch-row tap" data-act="toggleKids" role="switch" aria-checked="${d.kids}">
        <span><b>Enfants de moins de 5 ans</b><small>Kalou ajoutera des conseils bouillie et croissance</small></span>
        <span class="switch ${d.kids ? 'on' : ''}"><i></i></span>
      </button>`;
  } else {
    body = BUDGETS.map((o) => option(o, o.id === d.budget, 'setBudget')).join('') +
      `<span class="lbl" style="margin-top:8px">Langue préférée</span>
      <div class="grid2">${LANGS.map((l) => `<button class="lang tap ${l === d.lang ? 'on' : ''}" data-act="setLang" data-arg="${l}" aria-pressed="${l === d.lang}">${l}</button>`).join('')}</div>
      <small class="muted">L'audio en mooré, dioula et fulfuldé arrive bientôt. En attendant, Kalou lit ses astuces en français.</small>`;
  }
  const disabled = step === 0 && !d.name.trim();
  return `<section class="setup">
    <div class="setup-top">
      <button class="round" data-act="setupBack" aria-label="Retour">${icon('back', 20, '#141614', 1.8)}</button>
      <div class="segs" role="progressbar" aria-valuemin="0" aria-valuemax="4" aria-valuenow="${step + 1}" aria-label="Progression">
        ${[0, 1, 2, 3].map((i) => `<span><i style="width:${i < step ? 100 : i === step ? 50 : 0}%"></i></span>`).join('')}
      </div>
      <span class="muted">${step + 1}/4</span>
    </div>
    <div class="ask">
      <div class="ask-kalou">${kalou(pose, 96)}</div>
      <div class="ask-bubble popnow"><b>${q.title}</b><small>${q.hint}</small></div>
    </div>
    <div class="setup-body">${body}</div>
    ${cta(step < 3 ? 'Continuer' : (U.editing ? 'Enregistrer' : 'Créer mon plan'), 'setupNext', { disabled, id: 'setup-cta' })}
  </section>`;
}

/* ---------------- Accueil ---------------- */
export function home(S, U, C) {
  const p = S.profile;
  const meals = C.mealsFor(0);
  const taken = meals.filter((m) => m.takenAt).length;
  const water = C.waterToday();
  const pct = C.score(taken, water);
  const hour = new Date().getHours();
  const words = p.name.trim().split(/\s+/);
  const initials = ((words[0] || 'A')[0] + (words[1] ? words[1][0] : '')).toUpperCase();
  let cheer = 'On continue, ' + p.name + ' !';
  if (pct >= 100) cheer = 'Journée parfaite !';
  else if (pct >= 70) cheer = 'Bravo, ' + p.name + ' !';
  else if (taken === 0) cheer = 'Prêt·e pour bien manger ?';
  const goal = GOALS.find((g) => g.id === p.goal);
  const left = 8 - water;
  const tip = TIPS[S.tip % TIPS.length];
  return `<section class="page">
    <div class="hello fu d1">
      <button class="avatar" data-act="go" data-arg="profile" aria-label="Mon profil">${esc(initials)}</button>
      <div class="hello-txt"><small>${hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'}</small><b>${esc(p.name)}</b></div>
      ${C.isPlus ? `<button class="badge-plus" data-act="go" data-arg="offers">Plus · ${C.hoursLeft} h</button>` : ''}
      <button class="round" data-act="bell" aria-label="Rappels">${BELL_FILLED}</button>
    </div>

    <div class="card-hero fu d2">
      <div class="hero-kalou">${kalou(pct >= 100 ? 'bravo' : 'joie', 66)}</div>
      <div class="hero-txt">
        <small>Ton équilibre du jour</small>
        <b>${esc(cheer)}</b>
        <small>${cap(new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }))} · ${goal ? goal.label : ''}</small>
        <div class="chips"><span class="chip">${icon('drop', 12, '#141614', 2)}${water}/8 verres</span><span class="chip">${icon('bowl', 12, '#141614', 2)}${taken}/4 repas</span></div>
      </div>
      <div class="ring" role="img" aria-label="Équilibre ${pct} %">
        <svg width="86" height="86" viewBox="0 0 86 86"><circle cx="43" cy="43" r="35" fill="rgba(255,255,255,.6)" stroke="#E2EDE4" stroke-width="7"/><circle class="ring-arc" cx="43" cy="43" r="35" fill="none" stroke="url(#gRing)" stroke-width="7" stroke-linecap="round" stroke-dasharray="220" stroke-dashoffset="${Math.round(220 * (1 - pct / 100))}" transform="rotate(-90 43 43)"/></svg>
        <span><b>${pct}%</b><small>Équilibre</small></span>
      </div>
    </div>

    <div class="card water fu d3">
      <div class="row-between">
        <div><b>Eau aujourd'hui</b><small>${left > 0 ? `Encore ${left} verre${left > 1 ? 's' : ''} pour ton objectif` : 'Objectif atteint, bravo !'}</small></div>
        <div class="row"><button class="round-sm outline" data-act="waterMinus" aria-label="Retirer un verre">−</button><button class="btn-dark tap" data-act="waterPlus">+1 verre</button></div>
      </div>
      <div class="drops">${[...Array(8)].map((_, i) => `<span class="${i < water ? 'full' : ''}"><svg width="24" height="28" viewBox="0 0 24 28" aria-hidden="true"><path d="M12 2l7 8.5A9 9 0 1 1 5 10.5z" fill="${i < water ? 'url(#gDrop)' : '#EEF2F7'}" stroke="${i < water ? 'none' : '#D3DAE4'}" stroke-width="1.5"/></svg></span>`).join('')}</div>
    </div>

    <div class="fu d3">
      <div class="row-between sec-head"><h2>Actions rapides</h2><button class="chip-btn light" data-act="go" data-arg="profile">Personnaliser ${icon('sliders', 16, '#3C433D', 1.8)}</button></div>
      <div class="quick">
        <button class="qa" data-act="go" data-arg="plan"><span>${ICON3D.calendar}</span>Menu</button>
        <button class="qa" data-act="go" data-arg="improve"><span>${ICON3D.star}</span>Améliorer</button>
        <button class="qa" data-act="go" data-arg="market"><span>${ICON3D.basket}</span>Marché</button>
        <button class="qa" data-act="go" data-arg="chat"><span>${ICON3D.chat}</span>Kalou</button>
      </div>
    </div>

    ${!C.isPlus ? `<button class="promo tap fu d4" data-act="go" data-arg="offers">
      <span><small>MON ASSIETTE PLUS</small><b>${C.trialUsed ? 'Passe à Plus' : 'Essaie gratuitement pendant 72 h'}</b><em>Menus selon ton budget, programmes santé, nutritionniste.</em></span>
      <i>${icon('next', 18, '#0E0E0E', 2.2)}</i>
    </button>` : ''}

    <div class="tip-row fu d5">
      <div class="tip-kalou">${kalou('clin', 92)}</div>
      <div class="tip-bubble">
        <small>L'astuce de Kalou · ${(S.tip % TIPS.length) + 1}/${TIPS.length}</small>
        <p class="popnow">${esc(tip)}</p>
        <div class="row"><button class="chip-btn light" data-act="nextTip">Autre astuce</button><button class="chip-btn light" data-act="speak" aria-label="Écouter l'astuce">${icon('speaker', 15, '#3C433D', 1.8)} Écouter</button></div>
      </div>
    </div>

    <div class="fu d6">
      <div class="row-between sec-head"><h2>Repas du jour</h2><button class="link" data-act="go" data-arg="plan">Voir tout</button></div>
      <div class="meal-list">
        ${meals.map((m) => `<button class="meal tap ${m.takenAt ? 'done' : ''}" data-act="toggleMeal" data-arg="${m.key}" aria-pressed="${!!m.takenAt}">
          <span class="meal-ico">${food(m.icon)}</span>
          <span class="meal-txt"><b>${esc(m.name)}</b><small>${m.time} · ${esc(m.sub)}</small></span>
          ${m.takenAt ? pill('Pris à ' + m.takenAt, 'ok') : pill('À prendre', 'todo')}
        </button>`).join('')}
      </div>
      <p class="fine">Touche un repas pour le marquer comme pris. Conseils généraux : ils ne remplacent pas l'avis d'un médecin.</p>
    </div>
  </section>`;
}

/* ---------------- Plan repas ---------------- */
const SLOT_ICON = { Matin: ['sun', '#FFF6D6', '#B07800'], Collation: ['fruit', '#FFF0DC', '#C2410C'], Midi: ['clock', '#FDEBDC', '#C2410C'], Soir: ['moon', '#E4E8F7', '#3256C8'] };

export function plan(S, U, C) {
  const off = U.planOffset;
  const meals = C.mealsFor(off);
  const count = meals.filter((m) => m.takenAt).length;
  const pct = Math.round(count / 4 * 100);
  const sel = C.dateAt(off);
  const f = U.planFilter;
  let msg = 'Continue comme ça !';
  if (off < 0) msg = count === 4 ? 'Journée complète, bien joué.' : 'Journée passée.';
  else if (off > 0) msg = 'Jour à venir : prépare ta liste au marché.';
  else if (count === 4) msg = 'Journée parfaite !';
  else if (count === 0) msg = 'Commence par un bon petit-déjeuner.';
  else if (count === 3) msg = 'Plus que le dîner !';
  const shown = meals.filter((m) => f === 'Tout' || m.slot === f || (f === 'Matin' && m.slot === 'Collation'));
  return `<section class="page">
    ${header('Mon plan repas', { right: `<button class="round" data-act="bell" aria-label="Rappels">${icon('bell', 22, '#141614', 1.8)}</button>` })}
    <div class="card-cal fu d2">
      <div class="row-between" style="padding:0 6px"><b class="h3">${cap(sel.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }))}</b><button class="chip-btn" data-act="planDay" data-arg="0">Aujourd'hui</button></div>
      <div class="days">${[-3, -2, -1, 0, 1, 2, 3].map((o) => {
        const d = C.dateAt(o);
        const on = o === off;
        return `<button class="day tap ${on ? 'on' : ''}" data-act="planDay" data-arg="${o}" aria-pressed="${on}" aria-label="${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}">
          <span>${cap(d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''))}</span><b>${d.getDate()}</b><i class="${o === 0 ? 'today' : ''}"></i></button>`;
      }).join('')}</div>
      <div class="filters">${['Tout', 'Matin', 'Midi', 'Soir'].map((l) => `<button class="tap ${l === f ? 'on' : ''}" data-act="planFilter" data-arg="${l}" aria-pressed="${l === f}">${l}</button>`).join('')}</div>
    </div>

    <div class="fu d3">
      <h2 class="sec-title">${off === 0 ? 'Progression du jour' : off < 0 ? 'Bilan du jour' : 'Menu prévu'}</h2>
      <div class="card progress">
        <div class="row" style="gap:10px">
          <div class="prog-kalou">${kalou(pct >= 100 ? 'bravo' : pct >= 50 ? 'clin' : 'joie', 64)}</div>
          <div class="grow"><b class="h3">${count} repas sur 4</b><small class="muted">${msg}</small></div>
          ${pill(pct + ' % fait', 'ok')}
        </div>
        <div class="bar" role="img" aria-label="${pct} % des repas pris">
          <div class="bar-track"></div><div class="bar-ticks"></div>
          <div class="bar-fill" style="width:${pct}%"></div>
          <div class="bar-knob" style="left:${Math.max(4, Math.min(96, pct))}%"></div>
        </div>
      </div>
    </div>

    <div class="timeline fu d4">
      ${shown.map((m) => {
        const ic = SLOT_ICON[m.slot];
        let status = pill('Prévu', 'plan'); let note = '';
        if (m.takenAt) { status = pill('Pris', 'ok'); note = m.takenAt === '✓' ? 'fait' : 'à ' + m.takenAt; }
        else if (off === 0) { status = pill('À prendre', 'todo'); note = 'Toucher : pris'; }
        else if (off < 0) { status = pill('Non noté', 'plan'); }
        return `<div class="tl-head"><span class="tl-ico" style="background:${ic[1]}">${icon(ic[0], 15, ic[2], 2)}</span><h3>${m.slot} <small>– ${m.time}</small></h3></div>
          <button class="card meal-row tap" data-act="${off === 0 ? 'toggleMeal' : 'planInfo'}" data-arg="${m.key}" aria-pressed="${!!m.takenAt}">
            <span class="meal-ico ${m.takenAt ? 'done' : ''}">${food(m.icon)}</span>
            <span class="meal-txt"><b>${esc(m.name)}</b><small>${m.time} · ${esc(m.sub)}</small></span>
            <span class="meal-status">${status}<small class="${off === 0 && !m.takenAt ? 'warn' : ''}">${note}</small></span>
          </button>`;
      }).join('')}
    </div>

    <button class="card link-card tap fu d5" data-act="go" data-arg="improve">
      <span class="lc-ico" style="background:#FFF4CC">${icon('improve', 22, '#B45309', 2)}</span>
      <span class="grow"><b>Tu manges autre chose ?</b><small class="muted">Kalou t'aide à améliorer ton propre plat</small></span>
      ${icon('next', 18, '#141614', 2)}
    </button>
  </section>`;
}

/* ---------------- Améliorer ---------------- */
export function improve(S, U, C) {
  const dish = DISHES.find((d) => d.id === U.dish) || DISHES[0];
  const ck = U.checked;
  let score = dish.base;
  dish.tips.forEach((t, i) => { if (ck[i]) score += t.pts; });
  score = Math.min(100, score);
  const n = dish.tips.filter((_, i) => ck[i]).length;
  let says = 'Choisis ton plat, puis coche ce que tu peux changer. Petit à petit, ça compte !';
  if (n === 1) says = 'Super début ! Chaque petit changement fait monter ton score.';
  if (n >= 2 && n < 4) says = 'Ton ' + dish.name.toLowerCase() + ' devient vraiment équilibré. Encore un effort ?';
  if (n === 4) says = 'Version parfaite ! Ta famille va se régaler, et en meilleure santé.';
  if (U.saved) says = "C'est noté ! Retrouve tes plats améliorés dans ton profil.";
  const used = C.improvesThisWeek();
  const locked = !C.isPlus && used >= 3;
  return `<section class="page">
    ${header('Améliorer un plat', { right: `<span class="quota">${C.isPlus ? 'Illimité' : Math.max(0, 3 - used) + '/3 gratuits'}</span>` })}
    <div class="tip-row fu d2">
      <div class="tip-kalou">${kalou(n === 4 || U.saved ? 'bravo' : n ? 'clin' : 'joie', 88)}</div>
      <div class="tip-bubble"><p class="popnow" style="font-size:15px">${says}</p></div>
    </div>
    <div class="fu d3">
      <span class="lbl">Qu'est-ce que tu manges ?</span>
      <div class="dish-scroll">${DISHES.map((d) => `<button class="dish tap ${d.id === dish.id ? 'on' : ''}" data-act="pickDish" data-arg="${d.id}" aria-pressed="${d.id === dish.id}"><span>${food(d.color, 34)}</span>${d.short}</button>`).join('')}</div>
    </div>
    <div class="card-hero col fu d4">
      <div class="row-between" style="align-items:flex-end">
        <div><small class="muted">Score d'équilibre</small><b class="h3">${dish.name}</b></div>
        <div class="score"><b class="stamp" style="color:${score >= 80 ? '#15803D' : score >= 60 ? '#2C7546' : '#B45309'}">${score}</b><small>/100</small></div>
      </div>
      <div class="scorebar" role="img" aria-label="Score ${score} sur 100"><div style="width:${score}%"></div><i style="left:${dish.base}%"></i></div>
      <div class="row-between small"><span>Avant : ${dish.base}</span><b class="ok-txt">${score > dish.base ? '+' + (score - dish.base) + ' points' : 'Coche un conseil'}</b></div>
    </div>
    <div class="fu d5 stack">
      <h2 class="sec-title">Les conseils de Kalou</h2>
      ${dish.tips.map((t, i) => `<button class="opt tip-opt tap ${ck[i] ? 'on' : ''}" data-act="toggleTip" data-arg="${i}" role="checkbox" aria-checked="${!!ck[i]}">
        <span class="box">${icon('check', 14, '#fff', 3.4)}</span>
        <span class="opt-txt"><b>${t.t}</b><small>${t.why}</small></span>
        <span class="plus-pts">+${t.pts}</span>
      </button>`).join('')}
    </div>
    ${locked ? `<div class="card dark stack">
      <b class="h3">Tu as utilisé tes 3 améliorations gratuites de la semaine</b>
      <small>Avec Plus, améliore tous tes plats sans limite.${C.trialUsed ? '' : ' Essai gratuit de 72 h.'}</small>
      <button class="btn-light tap" data-act="go" data-arg="offers">${C.trialUsed ? 'Voir les offres' : 'Essayer Plus 72 h'}</button>
    </div>` : cta('Enregistrer ma version', 'saveImprove', { icon: 'check' })}
    <p class="fine">Conseils généraux à adapter. En cas de maladie, suis l'avis de ton médecin.</p>
  </section>`;
}

/* ---------------- Marché ---------------- */
export function market(S, U, C) {
  const b = U.budget;
  const m = MARKET[b] || MARKET[1000];
  const items = m.items.map((it, i) => ({ name: it[0], qty: it[1], key: b + '-' + i, on: !!S.bought[b + '-' + i] }));
  const bought = items.filter((i) => i.on).length;
  const house = HOUSEHOLDS.find((h) => h.id === S.profile.household);
  return `<section class="page">
    ${header('Marché et budget', { right: `<button class="round" data-act="shareList" aria-label="Partager la liste">${icon('share', 22, '#141614', 1.8)}</button>` })}
    <div class="card-hero col fu d2">
      <div class="row" style="gap:12px">
        <span class="big-ico">${ICON3D.basket}</span>
        <div><small class="muted">Budget par personne et par jour</small><b class="h2">${fmtF(b)} CFA</b><small class="muted">Cuisine pour ${house ? house.label.toLowerCase() : ''}</small></div>
      </div>
      <div class="seg3">${[500, 1000, 2000].map((v) => `<button class="tap ${v === b ? 'on' : ''}" data-act="setMarketBudget" data-arg="${v}" aria-pressed="${v === b}">${fmtF(v)}</button>`).join('')}</div>
    </div>
    <div class="card fu d3 stack">
      <div class="row" style="gap:8px">${icon('leaf', 18, '#2C7546', 2)}<b>De saison en ce moment</b></div>
      <div class="tags">${seasonFor(new Date().getMonth() + 1).map((s) => `<span>${s}</span>`).join('')}</div>
      <small class="muted">Souvent moins chers et plus frais. À adapter selon ta région.</small>
    </div>
    <div class="fu d4 stack">
      <div class="row-between"><h2 class="sec-title">Menu du jour proposé</h2><small class="muted">${fmtF(b)}</small></div>
      <div class="card list">${m.menu.map((x) => `<div class="li"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('')}</div>
    </div>
    <div class="fu d5 stack">
      <div class="row-between"><h2 class="sec-title">Ma liste de courses</h2>${pill(bought + '/' + items.length + ' achetés', 'ok')}</div>
      <div class="thin-bar"><div style="width:${Math.round(bought / items.length * 100)}%"></div></div>
      <div class="card list">${items.map((it) => `<button class="li check tap ${it.on ? 'on' : ''}" data-act="toggleItem" data-arg="${it.key}" role="checkbox" aria-checked="${it.on}">
        <span class="box round-box">${icon('check', 13, '#fff', 3.4)}</span><span class="grow">${it.name}</span><small>${it.qty}</small></button>`).join('')}</div>
      <button class="link center" data-act="clearList" data-arg="${b}">Tout décocher</button>
    </div>
    <button class="promo dark tap fu d6" data-act="weekMenu">
      <span><b>Menu de 7 jours + liste de la semaine</b><em>${C.isPlus ? 'Inclus dans ton essai Plus' : C.trialUsed ? 'Avec Mon Assiette Plus' : 'Essai gratuit 72 h'}</em></span>
      ${C.isPlus ? icon('next', 18, '#fff', 2) : `<i class="tag-plus">Plus</i>`}
    </button>
  </section>`;
}

/* ---------------- Chat ---------------- */
export function chat(S, U, C) {
  const msgs = S.chat.length ? S.chat : [{ from: 'kalou', text: 'Salut ' + S.profile.name + " ! Je suis Kalou. Pose-moi une question sur tes repas, ou touche une suggestion en bas." }];
  return `<section class="chat">
    <div class="chat-top">
      <button class="round" data-act="go" data-arg="home" aria-label="Retour">${icon('back', 20, '#141614', 1.8)}</button>
      <div class="chat-avatar">${kalou(U.typing ? 'clin' : 'joie', 48)}</div>
      <div class="grow"><b class="h3">Kalou</b><small class="online"><i></i>${U.typing ? 'écrit…' : 'en ligne'}</small></div>
      <button class="btn-dark sm tap" data-act="expert">Nutritionniste</button>
    </div>
    <div class="chat-list" id="chat-list" role="log" aria-live="polite">
      <span class="chat-note">Conseils généraux · ne remplacent pas un médecin</span>
      ${msgs.map((m) => `<div class="msg ${m.from === 'me' ? 'me' : ''}">${esc(m.text)}</div>`).join('')}
      ${U.typing ? `<div class="msg typing" aria-label="Kalou écrit"><i class="dot1"></i><i class="dot2"></i><i class="dot3"></i></div>` : ''}
    </div>
    <div class="chat-chips">${CHAT_CHIPS.map((c, i) => `<button class="tap" data-act="ask" data-arg="${i}">${esc(c)}</button>`).join('')}</div>
    <form class="chat-form" data-form="chat">
      <label for="chat-in" class="sr">Écris ta question</label>
      <input id="chat-in" type="text" value="${esc(U.chatDraft)}" placeholder="Pose ta question à Kalou…" autocomplete="off" maxlength="300" data-input="chatDraft" enterkeyhint="send">
      <button type="submit" class="send tap" aria-label="Envoyer">${icon('send', 22, '#fff', 2)}</button>
    </form>
  </section>`;
}

/* ---------------- Profil ---------------- */
export function profile(S, U, C) {
  const p = S.profile;
  const words = p.name.trim().split(/\s+/);
  const initials = ((words[0] || 'A')[0] + (words[1] ? words[1][0] : '')).toUpperCase();
  const goal = GOALS.find((g) => g.id === p.goal);
  const house = HOUSEHOLDS.find((h) => h.id === p.household);
  const infos = [['Objectif', goal ? goal.label : ''], ['Foyer', house ? house.label : ''], ['Enfants de moins de 5 ans', p.kids ? 'Oui' : 'Non'], ['Budget par jour', fmtF(p.budget)], ['Langue', p.lang]];
  const toggles = [['meals', 'Rappels repas', '7:30, 13:00 et 19:30'], ['water', 'Rappels eau', 'Toutes les 2 heures en journée'], ['tips', 'Astuce du jour', 'Un message de Kalou chaque matin']];
  const ABOUT = {
    about: "Les conseils de Mon Assiette suivent les recommandations générales de nutrition (assiette équilibrée, moins de sel et de sucre, aliments locaux). Ils sont en cours de relecture par des nutritionnistes. Ils ne remplacent jamais un médecin.",
    privacy: "Pas de compte, pas d'e-mail. Tes réponses sont liées à un identifiant anonyme de ce téléphone et servent seulement à personnaliser tes menus. Elles ne sont jamais vendues. « Effacer mes données » supprime tout de ce téléphone."
  };
  return `<section class="page">
    ${header('Mon profil')}
    <div class="card-hero fu d2">
      <span class="avatar xl">${esc(initials)}</span>
      <div class="grow"><b class="h2">${esc(p.name)}</b><small class="muted">${goal ? goal.label : ''}</small>${C.isPlus ? pill('Essai Plus actif', 'dark') : pill('Formule gratuite', 'plan')}</div>
      <button class="chip-btn" data-act="editProfile">Modifier</button>
    </div>
    <div class="card fu d3 stack ${C.isPlus ? 'dark' : ''}">
      <small class="kicker">ABONNEMENT</small>
      <b class="h3">${C.isPlus ? PLAN_NAMES[S.trial.plan] + ' · essai gratuit' : C.orgName ? 'Accès offert par ' + esc(C.orgName) : 'Formule gratuite'}</b>
      <small>${C.isPlus ? `Il te reste ${C.hoursLeft} h d'essai. Aucun paiement n'est prélevé pendant l'essai.` : C.trialUsed ? "Ton essai gratuit est terminé. Le paiement par Mobile Money arrive bientôt." : 'Plan du jour, astuces et suivi sont gratuits pour toujours.'}</small>
      ${C.isPlus ? `<div class="thin-bar light"><div style="width:${Math.round(C.hoursLeft / 72 * 100)}%"></div></div>
        <div class="row"><button class="btn-light tap" data-act="go" data-arg="offers">Changer de formule</button><button class="btn-ghost tap" data-act="cancelTrial">Arrêter l'essai</button></div>`
      : `<button class="btn-dark tap" data-act="go" data-arg="offers">${C.trialUsed ? 'Voir les offres' : 'Essayer Plus 72 h gratuit'}</button>`}
    </div>
    <div class="fu d4 stack">
      <h2 class="sec-title">Mes informations</h2>
      <div class="card list">${infos.map((i) => `<button class="li tap" data-act="editProfile"><small>${i[0]}</small><b>${esc(i[1])} ${icon('next', 14, '#9AA19B', 2)}</b></button>`).join('')}</div>
    </div>
    <div class="fu d5 stack">
      <h2 class="sec-title">Rappels</h2>
      <div class="card list">${toggles.map((t) => `<button class="li tap" data-act="toggleNotif" data-arg="${t[0]}" role="switch" aria-checked="${!!p.notif[t[0]]}">
        <span class="grow"><b>${t[1]}</b><small>${t[2]}</small></span><span class="switch ${p.notif[t[0]] ? 'on' : ''}"><i></i></span></button>`).join('')}</div>
      <small class="muted">Les rappels s'affichent quand l'app est ouverte ou installée sur ton téléphone.</small>
    </div>
    ${S.improvements.length ? `<div class="fu d5 stack"><h2 class="sec-title">Mes plats améliorés</h2><div class="card list">${S.improvements.slice(-5).reverse().map((x) => `<div class="li"><b>${esc(x.dish)}</b><small class="ok-txt">${x.score}/100</small></div>`).join('')}</div></div>` : ''}
    <div class="fu d6 stack">
      <h2 class="sec-title">Aide</h2>
      <div class="card list">
        ${C.canInstall ? `<button class="li tap" data-act="install"><b>${icon('download', 16, '#2C7546', 2)} Installer l'app sur mon téléphone</b>›</button>` : ''}
        <button class="li tap" data-act="go" data-arg="chat"><b>Poser une question à Kalou</b>›</button>
        <button class="li tap" data-act="info" data-arg="about"><b>Nos conseils sont-ils fiables ?</b>›</button>
        <button class="li tap" data-act="info" data-arg="privacy"><b>Mes données</b>›</button>
      </div>
      ${U.info ? `<div class="note popnow">${ABOUT[U.info]}</div>` : ''}
    </div>
    <button class="btn-danger tap" data-act="wipe">Effacer mes données et recommencer</button>
    <p class="fine">Mon Assiette · version 1.0</p>
  </section>`;
}

/* ---------------- Offres ---------------- */
export function offers(S, U, C) {
  const chosen = PLANS.find((p) => p.id === U.offerPlan) || PLANS[1];
  const digits = (U.phone || '').replace(/\D/g, '');
  const needsPhone = U.pay !== 'card';
  const phoneOk = !needsPhone || digits.length === 8;
  const payLabel = { orange: 'Orange Money', moov: 'Moov Money', card: 'Carte' }[U.pay];
  const canTrial = !C.trialUsed || C.isPlus;
  return `<section class="page">
    ${header('Mon Assiette <span class="green">Plus</span>')}
    <div class="promo hero fu d2">
      <div class="promo-kalou">${kalou('bravo', 108)}</div>
      <span><small class="tag">${canTrial ? 'ESSAI GRATUIT' : 'BIENTÔT'}</small><b>${canTrial ? '72 heures offertes' : 'Paiement Mobile Money'}</b><em>${canTrial ? "Rien à payer aujourd'hui. Tu arrêtes en un clic." : "Ton essai est terminé. Laisse ton numéro : on te prévient dès que le paiement est ouvert."}</em></span>
    </div>
    ${C.isPlus ? `<div class="card dark stack popnow"><b class="h3">Ton essai ${PLAN_NAMES[S.trial.plan]} est actif</b><small>Il te reste ${C.hoursLeft} h. Tu peux changer de formule ci-dessous.</small><button class="btn-ghost tap" data-act="cancelTrial">Arrêter l'essai</button></div>` : ''}
    <div class="fu d3 stack">${PLANS.map((p) => `<button class="plan tap ${p.id === chosen.id ? 'on' : ''}" data-act="pickPlan" data-arg="${p.id}" aria-pressed="${p.id === chosen.id}">
      <span class="radio"><i></i></span>
      <span class="grow"><b>${p.name}</b><small>${p.desc}</small></span>
      <span class="price"><b>${p.price}</b><small>${p.per}</small></span>
      ${p.popular ? '<span class="ribbon">Le plus choisi</span>' : ''}
    </button>`).join('')}</div>
    <div class="card fu d4 feat">
      <div class="feat-row head"><span>Ce qui est inclus</span><span>Gratuit</span><span class="green">Plus</span></div>
      ${FEATURES.map((f) => `<div class="feat-row"><span>${f[0]}</span><span class="${f[1] === '—' ? 'no' : 'yes'}">${f[1]}</span><span class="yes b">${f[2]}</span></div>`).join('')}
    </div>
    <div class="fu d5 stack">
      <span class="lbl">Moyen de paiement ${canTrial ? "après l'essai" : ''}</span>
      <div class="seg3 outline">${[['orange', 'Orange Money'], ['moov', 'Moov Money'], ['card', 'Carte']].map((m) => `<button class="tap ${m[0] === U.pay ? 'on' : ''}" data-act="pickPay" data-arg="${m[0]}" aria-pressed="${m[0] === U.pay}">${m[1]}</button>`).join('')}</div>
      ${needsPhone ? `<label for="pay-phone" class="lbl">Numéro ${payLabel}</label>
        <div class="phone ${digits.length === 0 ? '' : phoneOk ? 'ok' : 'warn'}"><span>+226</span><input id="pay-phone" type="tel" inputmode="numeric" value="${esc(U.phone)}" placeholder="70 00 00 00" maxlength="11" data-input="phone" autocomplete="tel-national"></div>
        <small class="muted" id="phone-hint">${digits.length === 0 ? '8 chiffres. Aucun paiement maintenant.' : phoneOk ? 'Numéro valide.' : 'Encore ' + (8 - digits.length) + ' chiffre(s).'}</small>`
      : `<small class="muted">La carte sera demandée de façon sécurisée, seulement si tu continues après l'essai.</small>`}
    </div>
    <div class="fu d6 stack">
      ${canTrial
        ? cta(C.isPlus ? 'Passer à la formule ' + chosen.name : "Commencer l'essai gratuit", 'startTrial', { pulse: true, sub: 'puis ' + chosen.price + ' ' + chosen.per + ' · sans engagement', disabled: !phoneOk, id: 'trial-cta' })
        : cta('Me prévenir', 'notifyMe', { disabled: !phoneOk, id: 'trial-cta' })}
      <div class="card stack">
        <button class="link-row" data-act="toggleCode">Code entreprise ou mutuelle ?<span>${U.showCode ? '˄' : '›'}</span></button>
        ${U.showCode ? `<form class="row" data-form="code"><label for="org-code" class="sr">Code</label><input id="org-code" class="field sm" type="text" value="${esc(U.code)}" placeholder="Ex. DEMO2026" data-input="code" autocapitalize="characters" maxlength="30"><button type="submit" class="btn-dark tap">Valider</button></form>` : ''}
        <button class="link-row" data-act="invite">Inviter un ami<span>›</span></button>
      </div>
      <p class="fine">Rappel avant la fin de l'essai. Aucun prélèvement si tu arrêtes avant 72 h. Prix en F CFA.</p>
    </div>
  </section>`;
}

export const TABS = [['home', 'Accueil'], ['plan', 'Repas'], ['improve', 'Améliorer'], ['market', 'Marché'], ['profile', 'Profil']];
export function tabbar(screen) {
  return `<nav class="tabbar" aria-label="Navigation principale">${TABS.map((t) => {
    const on = t[0] === screen;
    return `<button class="${on ? 'on' : ''}" data-act="go" data-arg="${t[0]}" aria-label="${t[1]}" ${on ? 'aria-current="page"' : ''}>${icon(t[0], 21, on ? '#0E0E0E' : '#fff', 2)}${on ? `<span>${t[1]}</span>` : ''}</button>`;
  }).join('')}</nav>`;
}
