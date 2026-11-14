// Écrans de Mon Assiette. Chaque fonction renvoie du HTML ; les actions passent par data-act.

import { kalou, img3d, icon, flag, faBadge } from './art.js';
import {
  SLIDES, SEXES, AGES, ACTIVITIES, GOALS, CONDITIONS, PREGNANCY, ALLERGENS, DIETS, HABITS,
  DISHES, SLOT_INFO, SLOT_WHY, NUTRIENTS, TAG_BENEFIT, HOW, PANTRY, CHAT_CHIPS,
  PLANS, PLAN_NAMES, FEATURES, APPETITE_TIPS, COUNTRIES, seasonForZone, SLOT_ORDER
} from './content.js';
import { now, wallClock, hhmm } from './time.js';

export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const longDate = (d) => cap(d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }));

function header(title, opts = {}) {
  return `<header class="topbar fu d1">
    <button class="round" data-act="go" data-arg="${opts.back || 'home'}" aria-label="Retour">${icon('back', 22, '#141614', 1.8)}</button>
    <h1 class="title">${title}</h1>
    ${opts.right || '<span class="round-spacer"></span>'}
  </header>`;
}
function cta(label, act, o = {}) {
  return `<button class="cta ${o.cls || ''}" data-act="${act}" ${o.arg != null ? `data-arg="${o.arg}"` : ''} ${o.disabled ? 'aria-disabled="true"' : ''} ${o.id ? `id="${o.id}"` : ''}>
    <span class="cta-dot ${o.pulse ? 'pulse' : ''}">${icon(o.icon || 'next', 20, '#0E0E0E', 2.2)}</span>
    <span class="cta-label">${label}${o.sub ? `<small>${o.sub}</small>` : ''}</span>
    ${o.arrows ? `<span class="cta-arrows" aria-hidden="true"><i class="ar1">›</i><i class="ar2">›</i><i class="ar3">›</i></span>` : ''}
  </button>`;
}
const pill = (t, k) => `<span class="pill pill-${k}">${t}</span>`;
const pills = (list, cur, act, multi) => `<div class="pills">${list.map((o) => {
  const on = multi ? cur.includes(o.id) : cur === o.id;
  return `<button class="pl tap ${on ? 'on' : ''}" data-act="${act}" data-arg="${o.id}" aria-pressed="${on}">${o.label}</button>`;
}).join('')}</div>`;

/* ================= Bienvenue ================= */
export function onboarding(S, U) {
  const step = U.onbStep, s = SLIDES[step], right = s.side === 'right';
  return `<section class="onb">
    <picture class="onb-photo"><source srcset="${s.img}.webp" type="image/webp"><img class="kb" src="${s.img}.jpg" alt="${esc(s.alt)}" style="object-position:${s.pos}" fetchpriority="high"></picture>
    <div class="onb-shade"></div><div class="onb-vignette"></div><div class="glow" aria-hidden="true"></div><div class="sweep" aria-hidden="true"></div>
    <div class="onb-top">
      ${step > 0 ? `<button class="glass round-sm" data-act="onbPrev" aria-label="Retour">${icon('prev', 20, '#fff', 2)}</button>` : '<span class="glass brand">Mon Assiette</span>'}
      <button class="glass chip-btn" data-act="onbSkip">Passer</button>
    </div>
    <div class="onb-panel rise">
      <span class="spark tw" style="top:22px;left:34px"></span><span class="spark tw2" style="top:60px;left:18px"></span><span class="spark tw3" style="top:120px;right:26px"></span>
      <div class="onb-kalou float" style="${right ? 'right:14px' : 'left:14px'}">${kalou(s.pose, 112)}</div>
      <div class="onb-bubble pop ${right ? 'br' : 'bl'}" style="${right ? 'right:130px' : 'left:130px'}">${esc(s.bubble)}</div>
      <h2 class="onb-title fu d2">${esc(s.title).replace('\n', '<br>')}</h2>
      <p class="onb-text fu d3">${esc(s.text)}</p>
      <div class="dots fu d4">${SLIDES.map((_, i) => `<button data-act="onbGo" data-arg="${i}" aria-label="Écran ${i + 1} sur 3"><span class="${i === step ? 'on' : ''}"></span></button>`).join('')}</div>
      ${cta(step < 2 ? 'Suivant' : 'Faire mon bilan', 'onbNext', { arrows: true, pulse: true, cls: 'fu d5' })}
    </div>
  </section>`;
}

/* ================= Bilan : la consultation ================= */
// req : obligatoire · opt : facultatif · mix : une partie obligatoire (signalée sur chaque question)
const STEPS = [
  { title: "Comment tu t'appelles ?", hint: 'Ta consultation avec Kalou : 8 petites étapes, 2 minutes.', req: 'req' },
  { title: 'Où vis-tu ?', hint: 'Ton menu suit les plats de ton pays, et l’heure de l’app suit son fuseau horaire.', req: 'req' },
  { title: 'Parle-moi un peu de toi', hint: 'Les besoins changent selon l’âge, le sexe et l’activité.', req: 'mix' },
  { title: 'Ton poids et ta taille ?', hint: 'Ça m’aide à mieux te conseiller. Rien n’est partagé.', req: 'opt' },
  { title: 'Qu’est-ce que tu veux améliorer ?', hint: 'Ton objectif principal.', req: 'req' },
  { title: 'Ta santé', hint: 'Réponds pour ta sécurité : coche ce qui te concerne, ou « Rien de tout ça ».', req: 'req' },
  { title: 'Allergies et régime', hint: 'Les aliments concernés seront retirés de tous tes menus.', req: 'mix' },
  { title: 'Tes habitudes', hint: 'Sois honnête : c’est pour t’aider, pas pour te juger.', req: 'opt' }
];
export const SETUP_STEPS = STEPS.length;
const fertileOf = (d) => d.sex === 'f' && ['13-17', '18-34', '35-59'].includes(d.age);
// Réponse obligatoire manquante pour cette étape (message), ou null
export function missingAnswer(step, d) {
  const a = d.answered || {};
  if (step === 0 && !(d.name || '').trim()) return 'Écris ton prénom pour continuer.';
  if (step === 1 && !COUNTRIES.some((c) => c.id === d.country)) return 'Choisis ton pays pour continuer.';
  if (step === 2 && (!d.sex || !d.age)) return 'Choisis ton sexe et ton âge pour continuer.';
  if (step === 4 && !d.goal) return 'Choisis ton objectif pour continuer.';
  if (step === 5 && !a.health) return 'Coche ce qui te concerne, ou « Rien de tout ça ».';
  if (step === 5 && fertileOf(d) && !a.preg) return 'Dis-moi si tu es enceinte ou allaitante.';
  if (step === 6 && !a.allergies) return 'Coche tes allergies, ou « Aucune allergie ».';
  return null;
}
const need = (req) => `<em class="need ${req ? 'req' : 'free'}">${req ? 'Obligatoire' : 'Facultatif'}</em>`;
const lblQ = (t, req, extra = '') => `<span class="lbl q" ${extra}>${t}${need(req)}</span>`;

export function setup(S, U) {
  const d = U.draft, step = U.setupStep;
  if (U.loading) {
    const items = ['Tes habitudes', 'Ta santé et tes allergies', 'Tes besoins du moment', 'Ton plan de repas'];
    return `<section class="setup"><div class="loading-box">
      ${kalou('clin', 150)}
      <h2>Kalou analyse tes réponses…</h2>
      <ul class="analyse">${items.map((t, i) => `<li style="animation-delay:${0.35 + i * 0.4}s">${icon('check', 16, '#fff', 3)}<span>${t}</span></li>`).join('')}</ul>
    </div></section>`;
  }
  const q = STEPS[step];
  let body = '';
  if (step === 0) {
    body = `<label for="f-name" class="lbl">Ton prénom</label>
      <input id="f-name" class="field ${d.name.trim() ? 'ok' : ''}" type="text" value="${esc(d.name)}" placeholder="Ex. Aminata" autocomplete="given-name" maxlength="40" data-input="name" enterkeyhint="next">`;
  } else if (step === 1) {
    const at = new Date(), cur = COUNTRIES.find((c) => c.id === d.country);
    const line = (c) => `${flag(c.id, 36)}<span class="opt-txt"><b>${c.label}</b><small>${c.gmt} · il y est ${hhmm(wallClock(c.tz, at))}${c.dial ? ' · ' + c.dial : ''}</small></span>`;
    body = `<span class="lbl">Ton pays de résidence</span>
      <div class="dd ${U.ddOpen ? 'open' : ''}">
        <button class="dd-btn tap" data-act="toggleDd" aria-haspopup="listbox" aria-expanded="${!!U.ddOpen}">
          ${cur ? line(cur) : `<span class="dd-ph">${flag('', 36)}<span class="opt-txt"><b>Choisis ton pays</b><small>Touche pour voir la liste</small></span></span>`}
          <span class="dd-chev">${icon('next', 18, '#3C433D', 2.2)}</span>
        </button>
        ${U.ddOpen ? `<div class="dd-list" role="listbox" aria-label="Pays">${COUNTRIES.map((c) => `<button class="dd-opt tap ${d.country === c.id ? 'on' : ''}" role="option" aria-selected="${d.country === c.id}" data-act="setCountry" data-arg="${c.id}">${line(c)}${d.country === c.id ? `<span class="dd-ok">${icon('check', 14, '#fff', 3.2)}</span>` : ''}</button>`).join('')}</div>` : ''}
      </div>
      <small class="muted">Le fuseau horaire choisi règle l’heure de l’app, même si ton téléphone est réglé autrement.</small>`;
  } else if (step === 2) {
    body = `${lblQ('Tu es', true)}${pills(SEXES, d.sex, 'setSex')}
      ${lblQ('Ton âge', true)}${pills(AGES, d.age, 'setAge')}
      ${lblQ('Ta journée', false)}${ACTIVITIES.map((o) => opt(o, d.activity === o.id, 'setActivity', null)).join('')}`;
  } else if (step === 3) {
    body = `<div class="grid2">
        <label class="num"><span>Poids</span><input type="number" inputmode="decimal" min="25" max="250" value="${d.weight || ''}" placeholder="—" data-input="weight"><em>kg</em></label>
        <label class="num"><span>Taille</span><input type="number" inputmode="numeric" min="120" max="220" value="${d.height || ''}" placeholder="—" data-input="height"><em>cm</em></label>
      </div>
      <small class="muted">Tu ne sais pas ? Laisse vide et continue.</small>`;
  } else if (step === 4) {
    body = GOALS.map((o) => opt(o, d.goal === o.id, 'setGoal', o.icon)).join('');
  } else if (step === 5) {
    const fertile = fertileOf(d), ans = d.answered || {};
    body = CONDITIONS.map((o) => opt(o, d.conditions.includes(o.id), 'toggleCond', null, true)).join('') +
      `<button class="opt tap ${ans.health && !d.conditions.length ? 'on' : ''}" data-act="noCond" aria-pressed="${!!ans.health && !d.conditions.length}"><span class="opt-txt"><b>Rien de tout ça</b></span><span class="opt-radio">${icon('check', 12, '#fff', 3.4)}</span></button>` +
      (fertile ? `${lblQ('Enceinte ou allaitante ?', true, 'style="margin-top:6px"')}${pills(PREGNANCY, ans.preg ? d.pregnancy : null, 'setPreg')}` : '');
  } else if (step === 6) {
    const ans = d.answered || {};
    body = `${lblQ('Tes allergies', true)}<div class="allergy-grid">${ALLERGENS.map((a) => {
      const on = d.allergies.includes(a.id);
      return `<button class="allergy tap ${on ? 'on' : ''}" data-act="toggleAllergy" data-arg="${a.id}" aria-pressed="${on}">${img3d(a.icon, 40)}<span>${a.label}</span></button>`;
    }).join('')}</div>
      <button class="opt tap ${ans.allergies && !d.allergies.length ? 'on' : ''}" data-act="noAllergy" aria-pressed="${!!ans.allergies && !d.allergies.length}"><span class="opt-txt"><b>Aucune allergie</b></span><span class="opt-radio">${icon('check', 12, '#fff', 3.4)}</span></button>
      ${lblQ('Ton régime', false, 'style="margin-top:6px"')}${pills(DIETS, d.diet, 'setDiet')}`;
  } else {
    body = HABITS.map((h) => `<div class="habit"><b>${h.q}</b><div class="pills">${h.opts.map((o) => {
      const on = d.habits[h.id] === o[0];
      return `<button class="pl tap ${on ? 'on' : ''}" data-act="setHabit" data-arg="${h.id}:${o[0]}" aria-pressed="${on}">${o[1]}</button>`;
    }).join('')}</div></div>`).join('');
  }
  const disabled = !!missingAnswer(step, d);
  const n = STEPS.length, only = U.countryOnly;
  return `<section class="setup">
    <div class="setup-top">
      <button class="round" data-act="setupBack" aria-label="Retour">${icon('back', 20, '#141614', 1.8)}</button>
      <div class="segs ${only ? 'hide' : ''}" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${step + 1}" aria-label="Progression">${STEPS.map((_, i) => `<span><i style="width:${i < step ? 100 : i === step ? 50 : 0}%"></i></span>`).join('')}</div>
      <span class="muted">${step + 1}/${n}</span>
    </div>
    <div class="ask"><div class="ask-kalou">${kalou(step === n - 1 ? 'bravo' : step % 2 ? 'clin' : 'joie', 88)}</div><div class="ask-bubble popnow"><b>${q.title}</b><small>${q.hint}</small>${q.req === 'mix' ? '<em class="need mix">Obligatoire en partie</em>' : need(q.req === 'req')}</div></div>
    <div class="setup-body">${body}</div>
    ${cta(only ? 'Enregistrer mon pays' : step < n - 1 ? 'Continuer' : (U.editing ? 'Mettre à jour mon bilan' : 'Voir mon bilan'), 'setupNext', { disabled, id: 'setup-cta' })}
    ${q.req === 'opt' && !only ? `<button class="link center" data-act="skipStep">${step < n - 1 ? 'Passer cette question' : 'Passer et voir mon bilan'}</button>` : ''}
  </section>`;
}
function opt(o, on, act, ico, check) {
  return `<button class="opt tap ${on ? 'on' : ''}" data-act="${act}" data-arg="${o.id}" aria-pressed="${on}">
    ${ico ? `<span class="opt-3d">${img3d(ico, 36)}</span>` : ''}
    <span class="opt-txt"><b>${o.label}</b>${o.desc ? `<small>${o.desc}</small>` : ''}</span>
    <span class="opt-radio ${check ? 'sq' : ''}">${icon('check', 12, '#fff', 3.4)}</span>
  </button>`;
}

/* ================= Rapport de bilan ================= */
export function bilan(S, U, C) {
  const A = C.A, p = S.profile;
  const sex = (SEXES.find((x) => x.id === p.sex) || {}).label || '';
  const age = (AGES.find((x) => x.id === p.age) || {}).label || '';
  const act = (ACTIVITIES.find((x) => x.id === p.activity) || {}).label || '';
  const first = U.firstBilan;
  return `<section class="page">
    ${first ? '' : header('Mon bilan', { back: 'profile' })}
    <div class="tip-row fu d1" ${first ? 'style="margin-top:8px"' : ''}>
      <div class="tip-kalou">${kalou('bravo', 92)}</div>
      <div class="tip-bubble"><small>Ton bilan nutritionnel</small><p>Merci ${esc(p.name)} ! Voici ce que je retiens de toi, et ce sur quoi on va travailler ensemble.</p></div>
    </div>

    <div class="card-hero col fu d2">
      <small class="muted">Ton portrait</small>
      <div class="portrait">
        <span>${img3d(p.pregnancy === 'enceinte' ? 'pregnant-woman' : p.age === '60+' ? 'older-person' : 'person-running', 44)}</span>
        <div><b class="h3">${esc(sex)} · ${esc(age)}</b><small class="muted">${esc(act)}${A.bmi ? ` · IMC ${String(A.bmi.value).replace('.', ',')}${A.bmi.label ? ' (' + A.bmi.label.toLowerCase() + ')' : ''}` : ''}</small></div>
      </div>
      ${A.bmi && A.bmi.note ? `<small class="muted">${A.bmi.note}</small>` : ''}
      <div class="habit-score">
        <div class="ring sm" role="img" aria-label="Habitudes ${A.habitScore} sur 100"><svg width="70" height="70" viewBox="0 0 86 86"><circle cx="43" cy="43" r="35" fill="#fff" stroke="#E2EDE4" stroke-width="8"/><circle class="ring-arc" cx="43" cy="43" r="35" fill="none" stroke="url(#gRing)" stroke-width="8" stroke-linecap="round" stroke-dasharray="220" stroke-dashoffset="${Math.round(220 * (1 - A.habitScore / 100))}" transform="rotate(-90 43 43)"/></svg><span><b>${A.habitScore}</b></span></div>
        <div><b>Tes habitudes : ${A.habitScore >= 75 ? 'très bonnes' : A.habitScore >= 50 ? 'correctes, à améliorer' : 'à travailler ensemble'}</b>
        <small class="muted">${A.habitDetails.filter((x) => x.good).length} points forts, ${A.habitDetails.filter((x) => !x.good).length} à améliorer</small></div>
      </div>
      <div class="hab-list">${A.habitDetails.map((h) => `<span class="${h.good ? 'good' : h.pts === 1 ? 'mid' : 'bad'}">${h.good ? '✓' : h.pts === 1 ? '~' : '!'} ${esc(h.q.replace(' ?', ''))} : ${esc(h.answer.toLowerCase())}</span>`).join('')}</div>
    </div>

    <div class="fu d3 stack">
      <h2 class="sec-title">Tes ${A.priorities.length > 1 ? A.priorities.length + ' priorités' : 'priorité'}</h2>
      ${A.priorities.map((x, i) => `<div class="prio card"><span class="prio-n">${i + 1}</span><span class="prio-ico">${img3d(x.icon, 44)}</span><div><b class="h3">${x.title}</b><small class="from">Pourquoi : ${x.from}</small><p>${x.why}</p></div></div>`).join('')}
      ${A.watch.length ? `<small class="muted">À surveiller aussi : ${A.watch.map((w) => w.title.toLowerCase()).join(', ')}.</small>` : ''}
    </div>

    <div class="grid2 fu d4">
      <div class="card stack"><b class="ok-txt">À privilégier</b>${A.favor.map((f) => `<small class="li-dot ok">${esc(f)}</small>`).join('')}</div>
      <div class="card stack"><b class="warn-txt">À limiter</b>${A.limit.map((f) => `<small class="li-dot no">${esc(f)}</small>`).join('')}</div>
    </div>

    ${A.excluded.length || p.diet === 'vegetarien' ? `<div class="card stack fu d4 alert">
      <div class="row">${img3d('shield', 36)}<b class="h3">Retiré de tous tes menus</b></div>
      <div class="tags red">${A.excluded.map((e) => `<span>${e}</span>`).join('')}${p.diet === 'vegetarien' ? '<span>Viande et poisson</span>' : ''}</div>
    </div>` : ''}

    <div class="card row fu d5">${img3d('droplet', 44)}<div class="grow"><b class="h3">Ton objectif d'eau : ${A.glasses} verres par jour</b><small class="muted">Environ ${(A.glasses * 0.25).toFixed(1).replace('.', ',')} litre${A.glasses > 4 ? 's' : ''}${p.activity === 'forte' ? ', plus quand tu travailles dur ou qu’il fait chaud' : ''}.</small></div></div>

    ${C.hasAppetite ? `<div class="card stack fu d5">${img3d('bowl-with-spoon', 36)}<b class="h3">Pour retrouver l’appétit</b>${APPETITE_TIPS.slice(0, 4).map((t) => `<small class="li-dot ok">${t}</small>`).join('')}</div>` : ''}

    ${A.notes.map((n) => `<div class="note warn fu d6">${img3d('warning', 28)}<span>${n}</span></div>`).join('')}

    <div class="fu d6 stack">
      ${cta(first ? 'Voir ma journée idéale' : 'Retour à ma journée', 'bilanDone', { pulse: first })}
      ${first ? '' : '<button class="link center" data-act="editProfile">Refaire mon bilan</button>'}
      <p class="fine">Bilan établi à partir des recommandations générales de nutrition (OMS, FAO). Il ne remplace pas une consultation médicale.</p>
    </div>
  </section>`;
}

/* ================= Accueil : le moment idéal ================= */
export function mealIcon(m, size = 30) { return img3d(m.icon || 'pot-of-food', size); }

export function home(S, U, C) {
  const p = S.profile, A = C.A, today = C.now;
  const hour = today.getHours();
  const words = p.name.trim().split(/\s+/);
  const initials = ((words[0] || 'A')[0] + (words[1] ? words[1][0] : '')).toUpperCase();
  const theme = C.theme(0);
  const hero = C.heroMeal();
  const nut = C.nutrients();
  const water = C.waterToday();
  const goal = A.glasses;
  const mission = C.mission();
  const day = C.day(0);
  return `<section class="page">
    <div class="hello fu d1">
      <button class="avatar" data-act="go" data-arg="profile" aria-label="Mon profil">${esc(initials)}</button>
      <div class="hello-txt"><small>${hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'}</small><b>${esc(p.name)}</b></div>
      <button class="streak ${C.streak ? 'on' : ''}" data-act="streakInfo" aria-label="Série de ${C.streak} jours">${img3d('fire', 24)}<b>${C.streak}</b></button>
      ${C.isPlus ? `<button class="badge-plus" data-act="go" data-arg="offers">Plus</button>` : ''}
    </div>

    <button class="theme tap fu d2" data-act="themeInfo">
      ${img3d(theme.icon, 40)}<span><small>${longDate(today)} · ${hhmm(today)}${C.country ? ' ' + C.country.gmt : ''}</small><b>${theme.title}</b></span>${icon('next', 16, '#2C7546', 2)}
    </button>

    ${!p.country ? `<button class="card country-ask tap fu d2" data-act="askCountry">${img3d('pot-of-food', 40)}<span class="grow"><b>Où vis-tu ?</b><small class="muted">Dis-le à Kalou : ton menu suivra les plats de ton pays, et l’heure suivra ton fuseau.</small></span>${icon('next', 16, '#2C7546', 2)}</button>` : ''}

    ${hero ? `<div class="hero-meal fu d2">
      <div class="hm-top"><span class="hm-when">${hero.when}</span><span class="hm-slot">${SLOT_INFO[hero.slot].label} · ${SLOT_INFO[hero.slot].time}</span></div>
      <div class="hm-main">
        <div class="hm-img">${mealIcon(hero, 84)}</div>
        <div class="hm-txt"><small>Idéal pour toi ${hero.isNow ? 'maintenant' : 'à ' + SLOT_INFO[hero.slot].time}</small><b>${esc(hero.name)}</b><em>${esc(hero.portion)}</em></div>
      </div>
      ${fiche(hero)}
      <p class="hm-why"><b>Pourquoi maintenant ?</b> ${SLOT_WHY[hero.slot]}</p>
      <div class="gives"><small>Ce repas t'apporte</small>${hero.gives.map((g) => `<span>${icon('check', 12, '#15803D', 3)}${g}</span>`).join('')}</div>
      <div class="hm-actions">
        <button class="btn-dark tap" data-act="eat" data-arg="${hero.slot}">${icon('check', 16, '#fff', 2.6)} Je le mange</button>
        <button class="chip-btn light tap" data-act="recipe" data-arg="0:${hero.slot}">Recette</button>
        <button class="chip-btn light tap" data-act="swap" data-arg="0:${hero.slot}">${icon('improve', 14, '#3C433D', 2)} Autre idée</button>
      </div>
      ${U.open === '0:' + hero.slot ? recipeBox(hero, '0:' + hero.slot, U) : ''}
    </div>` : `<div class="hero-meal done fu d2"><div class="hm-main"><div class="hm-img">${kalou('bravo', 84)}</div><div class="hm-txt"><small>Journée complète</small><b>Bravo, tu as tout noté !</b><em>Demain matin : ${esc(C.day(1)[0].name)}</em></div></div></div>`}

    <div class="card nut fu d3">
      <div class="row-between"><div><b class="h3">Ce que ton corps a reçu</b><small class="muted">${nut.covered}/${nut.total} apports aujourd'hui</small></div><button class="chip-btn light" data-act="nutInfo">Détails</button></div>
      <div class="nut-row">${nut.list.map((n) => `<span class="nu ${n.on ? 'on' : ''}" title="${n.label}">${img3d(n.icon, 30)}<small>${n.label}</small></span>`).join('')}</div>
      ${nut.missing.length ? `<small class="muted">${nut.next ? `Ton ${nut.next.slot} t'apportera : ${nut.next.adds.join(', ').toLowerCase()}.` : 'Il te manque : ' + nut.missing.map((m) => m.label.toLowerCase()).join(', ') + '.'}</small>` : '<small class="ok-txt">Tous les apports du jour sont là. Magnifique !</small>'}
      ${U.nutOpen ? `<div class="nut-detail">${nut.list.map((n) => `<small class="li-dot ${n.on ? 'ok' : 'no'}"><b>${n.label}</b> : ${n.body}</small>`).join('')}</div>` : ''}
    </div>

    <div class="card mission fu d3">
      <div class="row">${img3d(mission.icon, 44)}<div class="grow"><small class="kicker green">DÉFI DE LA SEMAINE</small><b class="h3">${mission.title}</b><small class="muted">${mission.desc}</small></div></div>
      <div class="m-dots">${[...Array(mission.goal)].map((_, i) => `<i class="${i < mission.done ? 'on' : ''}"></i>`).join('')}<span>${mission.done}/${mission.goal}</span></div>
      ${mission.done >= mission.goal ? '<b class="ok-txt">Défi réussi ! Kalou est fier de toi.</b>' : mission.today ? '<small class="ok-txt">Validé pour aujourd’hui. À demain !</small>' : `<button class="btn-dark tap" data-act="missionDone">Fait aujourd'hui</button>`}
    </div>

    <div class="card water fu d4">
      <div class="row-between">
        <div><b>Eau aujourd'hui</b><small>${water >= goal ? 'Objectif atteint, bravo !' : `${water}/${goal} verres · encore ${goal - water}`}</small></div>
        <div class="row"><button class="round-sm outline" data-act="waterMinus" aria-label="Retirer un verre">−</button><button class="btn-dark tap" data-act="waterPlus">+1 verre</button></div>
      </div>
      <div class="drops" style="grid-template-columns:repeat(${Math.min(goal, 12)},minmax(0,1fr))">${[...Array(Math.min(goal, 12))].map((_, i) => `<span class="${i < water ? 'full' : ''}">${img3d(i < water ? 'droplet' : 'droplet-empty', 26)}</span>`).join('')}</div>
    </div>

    <div class="fu d4">
      <div class="row-between sec-head"><h2>Ta journée idéale</h2><button class="link" data-act="go" data-arg="plan">Semaine</button></div>
      <div class="day-line">${day.map((m) => `<button class="dl tap ${m.takenAt ? 'done' : ''} ${hero && hero.slot === m.slot ? 'now' : ''}" data-act="eat" data-arg="${m.slot}" aria-pressed="${!!m.takenAt}">
        <small>${SLOT_INFO[m.slot].time}</small>${mealIcon(m, 34)}<span>${esc(m.name)}</span>${m.takenAt ? `<i>${icon('check', 12, '#fff', 3)}</i>` : ''}</button>`).join('')}</div>
    </div>

    <button class="wheel-promo tap fu d4" data-act="go" data-arg="wheel">
      <span class="wp-wheel" aria-hidden="true">${miniWheel()}</span>
      <span class="grow"><small>TU NE SAIS PAS QUOI PRÉPARER ?</small><b>Tourne la roue de Kalou</b><em>Que des plats bons pour toi, de ton pays, dans le temps que tu as.</em></span>
      ${icon('next', 18, '#fff', 2.2)}
    </button>

    <div class="quick fu d5">
      <button class="qa" data-act="go" data-arg="plan"><span>${img3d('spiral-calendar', 44)}</span>Ma semaine</button>
      <button class="qa" data-act="go" data-arg="cook"><span>${img3d('pot-of-food', 44)}</span>Cuisiner</button>
      <button class="qa" data-act="go" data-arg="market"><span>${img3d('basket', 44)}</span>Courses</button>
      <button class="qa" data-act="go" data-arg="chat"><span>${img3d('speech-balloon', 44)}</span>Kalou</button>
    </div>

    <div class="tip-row fu d5">
      <div class="tip-kalou">${kalou('clin', 88)}</div>
      <div class="tip-bubble"><small>Le conseil de Kalou pour toi</small><p class="popnow">${esc(C.tip())}</p>
        <div class="row"><button class="chip-btn light" data-act="nextTip">Autre conseil</button><button class="chip-btn light ${U.speaking === 'tip' ? 'speaking' : ''}" data-act="speak" aria-label="Écouter le conseil">${img3d('speaker-high-volume', 16)} ${U.speaking === 'tip' ? 'Stop' : 'Écouter'}</button></div></div>
    </div>

    ${!C.isPlus ? `<button class="promo tap fu d6" data-act="go" data-arg="offers"><span><small>MON ASSIETTE PLUS</small><b>${C.trialUsed ? 'Passe à Plus' : 'Essaie Plus gratuitement 72 h'}</b><em>Ta semaine complète, ta liste de courses, une nutritionniste.</em></span><i>${icon('next', 18, '#0E0E0E', 2.2)}</i></button>` : ''}
    <p class="fine">Conseils généraux qui ne remplacent pas l'avis d'un médecin.</p>
  </section>`;
}

// Petite fiche d'un plat : ce que c'est, temps de préparation, plat d'ici
export function fiche(m, full = true) {
  if (!m.desc && !m.min) return '';
  return `<div class="fiche">${full && m.desc ? `<p>${esc(m.desc)}</p>` : ''}<div class="fiche-meta">
    ${m.min ? `<span>${img3d('alarm-clock', 14)} ${m.min >= 60 ? Math.floor(m.min / 60) + ' h' + (m.min % 60 ? ' ' + (m.min % 60) : '') : m.min + ' min'}</span>` : ''}
    ${m.local ? `<span class="loc">${img3d('seedling', 14)} Plat de chez toi</span>` : ''}
    ${m.baseName && m.baseName !== m.name ? `<span class="aka">aussi appelé « ${esc(m.baseName)} »</span>` : ''}</div></div>`;
}
function recipeBox(m, k, U) {
  const steps = HOW[m.id] || [];
  const on = U && U.speaking === 'recipe';
  return `<div class="recipe popnow"><b>Comment le préparer${m.min ? ` <small class="muted">· ${m.min} min</small>` : ''}</b><ol>${steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
    ${m.ing && m.ing.length ? `<small class="muted">Il te faut : ${m.ing.map(esc).join(', ')}.</small>` : ''}
    ${k ? `<button class="listen tap ${on ? 'speaking' : ''}" data-act="speakRecipe" data-arg="${k}">${img3d('speaker-high-volume', 18)} ${on ? 'Arrêter la lecture' : 'Kalou te lit la recette'}${on ? '<i class="eq"><b></b><b></b><b></b></i>' : ''}</button>` : ''}</div>`;
}

/* ================= Ma semaine ================= */
export function plan(S, U, C) {
  const off = U.planOffset, d = C.dateAt(off), day = C.day(off), theme = C.theme(off);
  const locked = !C.isPlus && off > 1;
  return `<section class="page">
    ${header('Ma semaine')}
    <div class="card-cal fu d2">
      <div class="days">${[0, 1, 2, 3, 4, 5, 6].map((o) => {
        const x = C.dateAt(o), on = o === off;
        return `<button class="day tap ${on ? 'on' : ''}" data-act="planDay" data-arg="${o}" aria-pressed="${on}" aria-label="${longDate(x)}"><span>${o === 0 ? 'Auj.' : cap(x.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''))}</span><b>${x.getDate()}</b>${!C.isPlus && o > 1 ? `<i class="lk">${icon('lock', 10, 'currentColor', 2.4)}</i>` : '<i></i>'}</button>`;
      }).join('')}</div>
      <div class="theme flat">${img3d(theme.icon, 36)}<span><small>${longDate(d)}</small><b>${theme.title}</b><em>${theme.why}</em></span></div>
    </div>
    ${locked ? `<div class="card dark stack fu d3">${img3d('spiral-calendar', 44)}<b class="h3">Ta semaine complète avec Plus</b><small>Aujourd’hui et demain sont gratuits. Avec Plus, vois et prépare tes 7 jours à l’avance.</small><button class="btn-light tap" data-act="go" data-arg="offers">${C.trialUsed ? 'Voir les offres' : 'Essayer 72 h gratuites'}</button></div>`
    : `<div class="timeline fu d3">${day.map((m) => mealRow(m, off, U, C)).join('')}</div>`}
    <p class="fine">Le plan est calculé pour ton bilan : ${C.A.priorities.map((x) => x.title.toLowerCase()).join(', ')}${S.profile.allergies.length ? ', sans tes allergènes' : ''}.</p>
  </section>`;
}
function mealRow(m, off, U, C) {
  const info = SLOT_INFO[m.slot], k = off + ':' + m.slot;
  return `<div class="tl-head"><span class="tl-ico">${img3d(info.icon, 22)}</span><h3>${info.label} <small>– idéal à ${info.time}</small></h3>${m.themeHit ? '<span class="theme-dot">thème du jour</span>' : ''}</div>
  <div class="card meal-card ${m.takenAt ? 'done' : ''}">
    <div class="mc-top">
      <span class="meal-ico ${m.takenAt ? 'done' : ''}">${mealIcon(m, 34)}</span>
      <span class="meal-txt"><b>${esc(m.name)}</b><small>${esc(m.portion)}</small></span>
      ${off === 0 ? `<button class="check-btn ${m.takenAt ? 'on' : ''}" data-act="eat" data-arg="${m.slot}" aria-pressed="${!!m.takenAt}" aria-label="${m.takenAt ? 'Annuler' : 'Je l’ai mangé'}">${icon('check', 18, m.takenAt ? '#fff' : '#9AA19B', 2.6)}</button>` : ''}
    </div>
    ${m.desc ? `<p class="mc-desc">${esc(m.desc)}</p>` : ''}${fiche(m, false)}
    <div class="why-chips">${m.reasons.map((r) => `<span>${esc(r)}</span>`).join('')}</div>
    <div class="mc-actions"><button class="link sm" data-act="recipe" data-arg="${k}">${U.open === k ? 'Fermer' : 'Recette'}</button><button class="link sm" data-act="swap" data-arg="${k}">Autre idée</button>${m.takenAt ? `<small class="ok-txt">Mangé à ${m.takenAt}</small>` : ''}</div>
    ${U.open === k ? recipeBox(m, k, U) : ''}
  </div>`;
}

/* ================= Cuisiner ================= */
export function cook(S, U, C) {
  const tab = U.cookTab;
  return `<section class="page">
    ${header('Cuisiner')}
    <button class="wheel-promo slim tap fu d2" data-act="go" data-arg="wheel"><span class="wp-wheel" aria-hidden="true">${miniWheel()}</span><span class="grow"><b>Pas d’idée ? Tourne la roue</b><em>Kalou choisit avec toi</em></span>${icon('next', 18, '#fff', 2.2)}</button>
    <div class="seg2 fu d2"><button class="${tab === 'have' ? 'on' : ''}" data-act="cookTab" data-arg="have">J'ai ces ingrédients</button><button class="${tab === 'improve' ? 'on' : ''}" data-act="cookTab" data-arg="improve">Améliorer un plat</button></div>
    ${tab === 'have' ? cookHave(S, U, C) : cookImprove(S, U, C)}
  </section>`;
}
function cookHave(S, U, C) {
  const have = U.have;
  const res = have.length >= 2 ? C.cookWith(have) : [];
  return `<div class="tip-row fu d3"><div class="tip-kalou">${kalou(res.length ? 'bravo' : 'joie', 80)}</div><div class="tip-bubble"><p>${have.length < 2 ? 'Coche ce que tu as dans ta cuisine. Je te dis quoi préparer, adapté à ton bilan.' : res.length ? `Avec ça, tu peux préparer ${res.length} plat${res.length > 1 ? 's' : ''} bons pour toi !` : 'Ajoute encore un ou deux ingrédients pour que je trouve une idée.'}</p></div></div>
  <div class="card fu d3"><div class="tags pick">${PANTRY.map((i) => `<button class="tap ${have.includes(i) ? 'on' : ''}" data-act="toggleHave" data-arg="${esc(i)}" aria-pressed="${have.includes(i)}">${esc(i)}</button>`).join('')}</div>
  ${have.length ? '<button class="link center" data-act="clearHave">Tout décocher</button>' : ''}</div>
  ${res.map((m, i) => `<div class="card meal-card fu d4"><div class="mc-top"><span class="meal-ico">${mealIcon(m, 34)}</span><span class="meal-txt"><b>${esc(m.name)}</b><small>${m.missing.length ? 'Il te manque : ' + m.missing.map(esc).join(', ') : 'Tu as tout ce qu’il faut !'}</small></span></div>
    ${m.desc ? `<p class="mc-desc">${esc(m.desc)}</p>` : ''}${fiche(m, false)}
    <div class="why-chips">${m.reasons.map((r) => `<span>${esc(r)}</span>`).join('')}</div>
    <div class="mc-actions"><button class="link sm" data-act="recipe" data-arg="cook:${i}">${U.open === 'cook:' + i ? 'Fermer' : 'Recette'}</button></div>
    ${U.open === 'cook:' + i ? recipeBox(m, 'cook:' + i, U) : ''}</div>`).join('')}`;
}
function cookImprove(S, U, C) {
  const dishes = DISHES.filter((d) => !d.al.some((a) => S.profile.allergies.includes(a)));
  const dish = dishes.find((d) => d.id === U.dish) || dishes[0];
  const prio = C.A.priorities.map((x) => x.id).concat(C.A.watch.map((x) => x.id));
  const tips = dish.tips.map((t, i) => Object.assign({ i, mine: t.focus.some((f) => prio.includes(f)) }, t)).sort((a, b) => b.mine - a.mine);
  let score = dish.base; tips.forEach((t) => { if (U.checked[t.i]) score += t.pts; }); score = Math.min(100, score);
  const used = C.improvesThisWeek(), locked = !C.isPlus && used >= 3;
  return `<div class="fu d3"><span class="lbl">Qu'est-ce que tu manges ?</span>
    <div class="dish-scroll">${dishes.map((d) => `<button class="dish tap ${d.id === dish.id ? 'on' : ''}" data-act="pickDish" data-arg="${d.id}" aria-pressed="${d.id === dish.id}"><span>${img3d(d.icon, 42)}</span>${d.short}</button>`).join('')}</div></div>
  <div class="card-hero col fu d4">
    <div class="row-between" style="align-items:flex-end"><div><small class="muted">Score d'équilibre pour toi</small><b class="h3">${dish.name}</b></div><div class="score"><b class="stamp" style="color:${score >= 80 ? '#15803D' : score >= 60 ? '#2C7546' : '#B45309'}">${score}</b><small>/100</small></div></div>
    <div class="scorebar" role="img" aria-label="Score ${score} sur 100"><div style="width:${score}%"></div><i style="left:${dish.base}%"></i></div>
    <div class="row-between small"><span>Avant : ${dish.base}</span><b class="ok-txt">${score > dish.base ? '+' + (score - dish.base) + ' points' : 'Coche un conseil'}</b><span>${C.isPlus ? 'Illimité' : Math.max(0, 3 - used) + '/3 gratuits'}</span></div>
  </div>
  <div class="fu d5 stack">${tips.map((t) => `<button class="opt tip-opt tap ${U.checked[t.i] ? 'on' : ''}" data-act="toggleTip" data-arg="${t.i}" role="checkbox" aria-checked="${!!U.checked[t.i]}">
    <span class="box">${icon('check', 14, '#fff', 3.4)}</span><span class="opt-txt"><b>${t.t}</b><small>${t.why}</small>${t.mine ? '<em class="for-you">Pour tes priorités</em>' : ''}</span><span class="plus-pts">+${t.pts}</span></button>`).join('')}</div>
  ${locked ? `<div class="card dark stack"><b class="h3">Tes 3 améliorations gratuites de la semaine sont utilisées</b><small>Avec Plus, améliore tous tes plats sans limite.</small><button class="btn-light tap" data-act="go" data-arg="offers">Voir Plus</button></div>` : cta('Enregistrer ma version', 'saveImprove', { icon: 'check' })}`;
}

/* ================= Courses ================= */
export function market(S, U, C) {
  const days = C.isPlus ? 7 : 2;
  const items = C.shopping(days);
  const bought = items.filter((i) => S.bought[i.name]).length;
  return `<section class="page">
    ${header('Mes courses', { right: `<button class="round" data-act="shareList" aria-label="Partager la liste">${icon('share', 22, '#141614', 1.8)}</button>` })}
    <div class="card-hero fu d2">${img3d('basket', 56)}<div class="grow"><small class="muted">Calculée à partir de ton plan</small><b class="h3">${C.isPlus ? 'Pour ta semaine' : 'Pour aujourd’hui et demain'}</b><small class="muted">${items.length} produits · ${bought} déjà achetés</small></div></div>
    <div class="thin-bar fu d2"><div style="width:${items.length ? Math.round(bought / items.length * 100) : 0}%"></div></div>
    <div class="card list fu d3">${items.map((it) => {
      const on = !!S.bought[it.name];
      return `<button class="li check tap ${on ? 'on' : ''}" data-act="toggleItem" data-arg="${esc(it.name)}" role="checkbox" aria-checked="${on}"><span class="box round-box">${icon('check', 13, '#fff', 3.4)}</span><span class="grow">${esc(it.name)}</span><small>${it.n} repas</small></button>`;
    }).join('')}</div>
    ${bought ? '<button class="link center" data-act="clearList">Tout décocher</button>' : ''}
    <div class="card stack fu d4"><div class="row">${img3d('seedling', 30)}<b>De saison en ce moment</b></div><div class="tags">${seasonForZone((C.country || {}).zone, C.now.getMonth() + 1).map((s) => `<span>${s}</span>`).join('')}</div><small class="muted">${C.country && !C.country.id.startsWith('autre') ? 'Saison ' + esc(C.country.in) + '. ' : ''}Plus frais, plus savoureux, moins cher.</small></div>
    ${!C.isPlus ? `<button class="promo dark tap fu d5" data-act="go" data-arg="offers"><span><b>La liste de toute ta semaine</b><em>${C.trialUsed ? 'Avec Mon Assiette Plus' : 'Essai gratuit 72 h'}</em></span><i class="tag-plus">Plus</i></button>` : ''}
  </section>`;
}

/* ================= Chat ================= */
export function chat(S, U, C) {
  const msgs = S.chat.length ? S.chat : [{ from: 'kalou', text: 'Salut ' + S.profile.name + " ! Je connais ton bilan. Pose-moi une question sur tes repas, ou touche une suggestion en bas." }];
  return `<section class="chat">
    <div class="chat-top">
      <button class="round" data-act="go" data-arg="home" aria-label="Retour">${icon('back', 20, '#141614', 1.8)}</button>
      <div class="chat-avatar">${kalou(U.typing ? 'clin' : 'joie', 48)}</div>
      <div class="grow"><b class="h3">Kalou</b><small class="online"><i></i>${U.typing ? 'écrit…' : 'ton assistant nutrition'}</small></div>
      <button class="btn-dark sm tap" data-act="expert">${img3d('stethoscope', 18)} Nutritionniste</button>
    </div>
    <div class="chat-list" id="chat-list" role="log" aria-live="polite">
      <span class="chat-note">Conseils généraux · ne remplacent pas un médecin</span>
      ${msgs.map((m, i) => m.from === 'me' ? `<div class="msg me">${esc(m.text)}</div>`
        : `<div class="msg">${esc(m.text)}${S.chat.length ? `<button class="msg-say tap ${U.speaking === 'msg' + i ? 'speaking' : ''}" data-act="speakMsg" data-arg="${i}" aria-label="${U.speaking === 'msg' + i ? 'Arrêter' : 'Écouter'}">${img3d('speaker-high-volume', 16)}${U.speaking === 'msg' + i ? '<i class="eq"><b></b><b></b><b></b></i>' : ''}</button>` : ''}</div>`).join('')}
      ${U.typing ? '<div class="msg typing" aria-label="Kalou écrit"><i class="dot1"></i><i class="dot2"></i><i class="dot3"></i></div>' : ''}
    </div>
    <div class="chat-chips">${CHAT_CHIPS.map((c, i) => `<button class="tap" data-act="ask" data-arg="${i}">${esc(c)}</button>`).join('')}</div>
    <form class="chat-form" data-form="chat"><label for="chat-in" class="sr">Écris ta question</label>
      <input id="chat-in" type="text" value="${esc(U.chatDraft)}" placeholder="Pose ta question à Kalou…" autocomplete="off" maxlength="300" data-input="chatDraft" enterkeyhint="send">
      <button type="submit" class="send tap" aria-label="Envoyer">${icon('send', 22, '#fff', 2)}</button></form>
  </section>`;
}

/* ================= Profil ================= */
export function profile(S, U, C) {
  const p = S.profile;
  const words = p.name.trim().split(/\s+/);
  const initials = ((words[0] || 'A')[0] + (words[1] ? words[1][0] : '')).toUpperCase();
  const toggles = [['meals', 'Rappels des repas', 'Au moment idéal de chaque repas'], ['water', 'Rappels eau', 'Toutes les 2 heures en journée'], ['tips', 'Conseil du matin', 'Un message de Kalou à 8 h']];
  const ABOUT = {
    about: "Ton plan est calculé à partir de ton bilan, selon les recommandations générales de nutrition de l'OMS et de la FAO : assiette équilibrée, moins de sel, de sucre et de gras, plus de légumes, de haricot et de céréales locales. Chaque règle (diabète, tension, grossesse, allergies…) est appliquée automatiquement. Les contenus sont en relecture par des nutritionnistes. Ils ne remplacent jamais un médecin.",
    privacy: "Pas de compte, pas d'e-mail. Ta santé, tes allergies et tes habitudes restent sur ce téléphone : elles ne sont jamais envoyées. Seuls ton prénom, ton objectif et ton suivi des repas sont sauvegardés de façon anonyme. « Effacer mes données » supprime tout."
  };
  return `<section class="page">
    ${header('Mon profil')}
    <div class="card-hero fu d2"><span class="avatar xl">${esc(initials)}</span><div class="grow"><b class="h2">${esc(p.name)}</b><small class="muted">${C.A.priorities.map((x) => x.title).join(' · ')}</small>${C.paid ? pill('Plus actif', 'dark') : C.trialOn ? pill('Essai Plus actif', 'dark') : pill('Formule gratuite', 'plan')}</div></div>
    <div class="card list fu d3">
      <button class="li tap" data-act="go" data-arg="bilan"><span class="row">${img3d('clipboard', 28)}<b>Mon bilan nutritionnel</b></span>›</button>
      <button class="li tap" data-act="editProfile"><span class="row">${img3d('counterclockwise-arrows-button', 28)}<b>Refaire mon bilan</b></span>›</button>
      <button class="li tap" data-act="askCountry"><span class="row">${C.country ? flag(C.country.id, 30) : img3d('alarm-clock', 28)}<span><b>${C.country ? esc(C.country.label) : 'Choisir mon pays'}</b><small>${C.country ? 'Heure de l’app : ' + hhmm(C.now) + ' (' + C.country.gmt + ')' : 'Pour ton menu et ton heure'}</small></span></span>›</button>
      <button class="li tap" data-act="toggleSound" role="switch" aria-checked="${S.sound}"><span class="row">${img3d(S.sound ? 'speaker-high-volume' : 'muted-speaker', 28)}<b>Sons</b></span><span class="switch ${S.sound ? 'on' : ''}"><i></i></span></button>
      <div class="li voice-li"><span class="row">${img3d('speech-balloon', 28)}<span><b>Voix de Kalou</b><small>${C.cloudVoice ? esc(C.cloudVoice.label) + ' · voix humaine' : C.voiceNow ? esc(C.prettyVoice(C.voiceNow)) : 'Voix du téléphone'}</small></span></span>
        <button class="chip-btn light tap ${U.speaking === 'test' ? 'speaking' : ''}" data-act="testVoice">${img3d('speaker-high-volume', 16)} ${U.speaking === 'test' ? 'Stop' : 'Essayer'}</button></div>
      ${!C.cloudOff ? `<div class="voice-list"><small class="vl-title">Voix humaines</small>${C.cloudVoices.map((v) => `<button class="pl vc tap ${S.voice === 'cloud:' + v.id ? 'on' : ''}" data-act="pickVoice" data-arg="cloud:${v.id}"><b>${v.label}</b><small>${v.desc}</small></button>`).join('')}</div>` : ''}
      ${C.voices.length ? `<div class="voice-list"><small class="vl-title">${C.cloudOff ? 'Voix du téléphone' : 'Sans internet : voix du téléphone'}</small>${C.voices.slice(0, 5).map((v) => `<button class="pl tap ${S.voice === v.voiceURI ? 'on' : ''}" data-act="pickVoice" data-arg="${esc(v.voiceURI)}">${esc(C.prettyVoice(v))}</button>`).join('')}</div>` : ''}
      <div class="li"><span class="row">${img3d(C.dark ? 'crescent-moon' : 'sun', 28)}<b>Apparence</b></span><span class="theme-seg">${[['clair', 'Clair'], ['sombre', 'Sombre'], ['auto', 'Auto']].map(([k, l]) => `<button class="tap ${(S.theme || 'clair') === k ? 'on' : ''}" data-act="setTheme" data-arg="${k}" aria-pressed="${(S.theme || 'clair') === k}">${l}</button>`).join('')}</span></div>
    </div>
    <button class="abo-link ${C.paid ? 'on' : C.trialOn ? 'trial' : ''} tap fu d3" data-act="go" data-arg="abonnement">
      <span class="abo-link-ic">${img3d(C.isPlus ? 'trophy' : 'credit-card', 26)}</span>
      <span class="grow"><small>MON ABONNEMENT</small><b>${C.paid ? (PLAN_NAMES[C.paidPlan] || 'Mon Assiette Plus') + ' · actif' : C.trialOn ? 'Essai Plus · ' + C.hoursLeft + ' h restantes' : C.orgName ? 'Accès offert par ' + esc(C.orgName) : 'Formule gratuite'}</b><em>${C.paid ? 'Encore ' + C.daysLeft + ' jour' + (C.daysLeft > 1 ? 's' : '') : 'Statut, clé, historique, aide'}</em></span>
      ${icon('next', 18, 'currentColor', 2.2)}</button>
    <div class="fu d4 stack"><h2 class="sec-title">Rappels au moment idéal</h2>
      <div class="card list">${toggles.map((t) => `<button class="li tap" data-act="toggleNotif" data-arg="${t[0]}" role="switch" aria-checked="${!!p.notif[t[0]]}"><span class="grow"><b>${t[1]}</b><small>${t[2]}</small></span><span class="switch ${p.notif[t[0]] ? 'on' : ''}"><i></i></span></button>`).join('')}</div>
      <small class="muted">Les rappels s'affichent quand l'app est ouverte ou installée.</small></div>
    ${S.improvements.length ? `<div class="fu d5 stack"><h2 class="sec-title">Mes plats améliorés</h2><div class="card list">${S.improvements.slice(-5).reverse().map((x) => `<div class="li"><b>${esc(x.dish)}</b><small class="ok-txt">${x.score}/100</small></div>`).join('')}</div></div>` : ''}
    <div class="fu d6 stack"><h2 class="sec-title">Aide</h2>
      <div class="card list">
        ${C.canInstall ? `<button class="li tap" data-act="install"><b>${icon('download', 16, '#2C7546', 2)} Installer l'app</b>›</button>` : ''}
        <button class="li tap" data-act="go" data-arg="chat"><b>Poser une question à Kalou</b>›</button>
        <button class="li tap" data-act="info" data-arg="about"><b>Sur quelle base sont faits mes menus ?</b>›</button>
        <button class="li tap" data-act="info" data-arg="privacy"><b>Mes données</b>›</button>
      </div>
      ${U.info ? `<div class="note popnow">${ABOUT[U.info]}</div>` : ''}</div>
    <button class="btn-danger tap" data-act="wipe">Effacer mes données et recommencer</button>
    <p class="fine">Mon Assiette · version 4.1 · Icônes Font Awesome (CC BY 4.0)</p>
  </section>`;
}

/* ================= Mon abonnement ================= */
export function abonnement(S, U, C) {
  const fmt = (d, y) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: y ? 'numeric' : undefined });
  const lastPlan = S.plus && S.plus.plan;
  const expired = !C.paid && S.plus && S.plus.until;
  let state, kicker, title, sub, pct = 0, big = '', unit = '';
  if (C.paid) {
    const total = C.paidPlan === 'semaine' ? 7 : C.paidPlan === 'trimestre' ? 90 : C.paidPlan === 'annee' ? 365 : 30;
    state = 'on'; kicker = 'ACTIF'; title = PLAN_NAMES[C.paidPlan] || 'Mon Assiette Plus';
    big = C.daysLeft; unit = C.daysLeft > 1 ? 'jours restants' : 'jour restant';
    sub = 'Jusqu’au ' + fmt(C.paidUntil, true); pct = Math.min(100, Math.round(C.daysLeft / total * 100));
  } else if (C.trialOn) {
    state = 'trial'; kicker = 'ESSAI GRATUIT'; title = 'Essai Plus · 72 h';
    big = C.hoursLeft; unit = C.hoursLeft > 1 ? 'heures restantes' : 'heure restante';
    sub = 'Aucun paiement pendant l’essai'; pct = Math.round(C.hoursLeft / 72 * 100);
  } else if (expired) {
    state = 'off'; kicker = 'TERMINÉ'; title = (PLAN_NAMES[lastPlan] || 'Mon Assiette Plus') + ' · expiré';
    sub = 'Terminé le ' + fmt(S.plus.until, true) + '. Tes données sont gardées : reprends quand tu veux.';
  } else if (C.orgName) {
    state = 'org'; kicker = 'ACCÈS OFFERT'; title = 'Offert par ' + esc(C.orgName); sub = 'Grâce au code de ton entreprise ou de ta mutuelle.';
  } else {
    state = 'free'; kicker = 'FORMULE GRATUITE'; title = 'Mon Assiette'; sub = C.trialUsed ? 'Ton essai est terminé. Passe à Plus quand tu veux.' : 'Bilan, plan du jour, défis et suivi : gratuits pour toujours.';
  }
  const R = 46, L = 2 * Math.PI * R;
  const ring = big !== '' ? `<div class="abo-ring"><svg viewBox="0 0 108 108" width="108" height="108"><circle cx="54" cy="54" r="${R}" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="9"/><circle cx="54" cy="54" r="${R}" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(L * pct / 100).toFixed(1)} ${L.toFixed(1)}" transform="rotate(-90 54 54)"/></svg><span><b>${big}</b><small>${unit}</small></span></div>`
    : `<div class="abo-kalou">${kalou(state === 'off' ? 'clin' : 'joie', 96)}</div>`;

  const actions = C.paid ? `<button class="abo-main tap" data-act="go" data-arg="offers">Prolonger mon abonnement</button><small class="abo-hint">Les jours achetés s’ajoutent à ceux qui restent.</small>`
    : C.trialOn ? `<button class="abo-main tap" data-act="go" data-arg="offers">Garder Plus après l’essai</button><button class="abo-sec tap" data-act="cancelTrial">Arrêter l’essai</button>`
    : `<button class="abo-main tap" data-act="go" data-arg="offers">${expired ? 'Reprendre Plus' : C.trialUsed ? 'Passer à Plus' : 'Essayer Plus 72 h gratuit'}</button>`;

  const wheelLeft = C.isPlus ? null : Math.max(0, C.wheelLeft(C.slotNow));
  const imp = C.improvesThisWeek();
  const usage = [
    ['party-popper', 'Roue de Kalou', C.isPlus ? 'Illimitée' : `${wheelLeft} tour${wheelLeft > 1 ? 's' : ''} restant${wheelLeft > 1 ? 's' : ''} pour ce repas`, C.isPlus ? 100 : wheelLeft / 4 * 100],
    ['counterclockwise-arrows-button', 'Plats améliorés', C.isPlus ? `${imp} cette semaine · illimité` : `${imp} / 3 cette semaine`, C.isPlus ? 100 : Math.max(0, (3 - imp) / 3 * 100)],
    ['spiral-calendar', 'Plan de 7 jours', C.isPlus ? 'Ouvert' : 'Avec Plus', C.isPlus ? 100 : 0],
    ['basket', 'Courses de la semaine', C.isPlus ? 'Ouvertes' : '2 jours seulement', C.isPlus ? 100 : 28]
  ];

  const log = (S.subLog || []).slice().reverse();
  const keyMask = S.lastKey ? S.lastKey.slice(0, 4) + ' •••• ' + S.lastKey.slice(-4) : '';
  const keyOpen = U.showKey;

  return `<section class="page abo">
    ${header('Mon abonnement', { back: 'profile' })}

    <div class="abo-hero ${state} fu d2">
      <div class="abo-txt"><small>${kicker}</small><b>${title}</b><span>${sub}</span></div>
      ${ring}
    </div>

    <div class="abo-actions fu d2">${actions}</div>

    <div class="fu d3 stack"><h2 class="sec-title">Mon utilisation</h2>
      <div class="card list">${usage.map((u) => `<div class="li abo-use"><span class="row">${img3d(u[0], 26)}<span><b>${u[1]}</b><small>${u[2]}</small></span></span><span class="abo-bar"><i style="width:${Math.round(u[3])}%"></i></span></div>`).join('')}</div></div>

    <div class="fu d3 stack"><h2 class="sec-title">Gratuit ou Plus</h2>
      <div class="card abo-cmp"><div class="abo-row head"><span></span><b>Gratuit</b><b class="plus">Plus</b></div>
      ${FEATURES.map((f) => `<div class="abo-row"><span>${f[0]}</span><em>${f[1] === '✓' ? icon('check', 15, '#2C7546', 2.6) : f[1] === '—' ? '<i class="no">—</i>' : f[1]}</em><em class="plus">${f[2] === '✓' ? icon('check', 15, '#fff', 2.6) : f[2]}</em></div>`).join('')}</div></div>

    <div class="fu d4 stack"><h2 class="sec-title">Ma clé Plus</h2>
      <div class="card stack abo-key">
        ${keyMask ? `<div class="li"><span class="row">${img3d('shield', 26)}<span><b class="mono">${esc(keyMask)}</b><small>Active sur ce téléphone · preuve d’achat</small></span></span><button class="chip-btn light tap" data-act="copyKey">Copier</button></div>` : `<small class="muted">Après un paiement, ta clé arrive à l’écran et par e-mail. Colle-la ici pour activer Plus.</small>`}
        <button class="link-row" data-act="toggleKey"><b>${img3d('sparkles', 20)} ${keyMask ? 'Activer une nouvelle clé' : 'J’ai une clé à activer'}</b><span>${keyOpen ? '˄' : '›'}</span></button>
        ${keyOpen ? `<form class="stack" data-form="lic">
          <div class="key-row"><input class="field" type="text" value="${esc(C.licKey)}" placeholder="Colle ta clé ici" data-input="licKey" autocapitalize="characters" autocomplete="off" spellcheck="false" maxlength="120" aria-label="Clé d’activation">
            <button type="button" class="chip-btn light tap" data-act="pasteKey">Coller</button></div>
          <button type="submit" class="btn-dark tap" ${C.licBusy ? 'disabled' : ''}>${C.licBusy ? 'Vérification…' : 'Activer ma clé'}</button></form>` : ''}
      </div></div>

    <div class="fu d4 stack"><h2 class="sec-title">Historique</h2>
      <div class="card list">${log.length ? log.slice(0, 8).map((e) => `<div class="li"><span class="row">${img3d(e.t === 'trial' ? 'alarm-clock' : e.t === 'stop' ? 'warning' : 'credit-card', 24)}<span><b>${esc(e.label)}</b><small>${fmt(e.at, true)}${e.until ? ' · jusqu’au ' + fmt(e.until, true) : ''}</small></span></span>${e.amount ? `<em class="abo-amt">${esc(e.amount)}</em>` : ''}</div>`).join('')
        : `<div class="li"><small class="muted">Aucun paiement pour l’instant.</small></div>`}</div></div>

    <div class="fu d5 stack"><h2 class="sec-title">Besoin d’aide ?</h2>
      <div class="card list">
        <button class="li tap" data-act="syncPlus" ${U.syncing ? 'disabled' : ''}><span class="row">${img3d('counterclockwise-arrows-button', 24)}<span><b>${U.syncing ? 'Vérification…' : 'Restaurer mon abonnement'}</b><small>Si tu as payé et que Plus ne s’affiche pas</small></span></span>›</button>
        ${[['J’ai perdu ma clé', 'Elle se trouve dans l’e-mail de confirmation envoyé par Chariow juste après ton paiement. Cherche « Mon Assiette Plus » dans ta boîte mail.'],
           ['Vais-je être prélevé automatiquement ?', 'Non, jamais. Plus s’arrête tout seul à la date de fin. Tu prolonges seulement si tu le veux.'],
           ['Que se passe-t-il à la fin ?', 'Tu repasses à la formule gratuite. Ton bilan, ton suivi et tes plats améliorés restent sur ton téléphone.'],
           ['J’ai changé de téléphone', 'Une clé s’active sur un seul téléphone. Garde l’ancien si possible, ou achète une nouvelle clé pour le nouveau téléphone.']]
          .map((q, i) => `<div class="faq ${U.faq === 10 + i ? 'open' : ''}"><button class="tap" data-act="faq" data-arg="${10 + i}" aria-expanded="${U.faq === 10 + i}">${q[0]}<span>${U.faq === 10 + i ? '−' : '+'}</span></button>${U.faq === 10 + i ? `<p>${q[1]}</p>` : ''}</div>`).join('')}
      </div></div>
    <p class="fine">Paiements traités par Chariow. Prix en F CFA. Aucun prélèvement automatique.</p>
  </section>`;
}

/* ================= Offres ================= */
export function offers(S, U, C) {
  const chosen = PLANS.find((p) => p.id === U.offerPlan) || PLANS[PLANS.length - 1];
  const canTrial = !C.paid && (!C.trialUsed || C.trialOn);
  const freshTrial = canTrial && !C.trialOn;
  const until = C.paidUntil ? C.paidUntil.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const link = C.chariowLink(chosen.id);
  const ops = C.payMethods.filter((m) => m.id !== 'card');
  const keyOpen = U.showKey || (!freshTrial && !C.paid && !C.trialOn);
  const amount = Number(chosen.price.replace(/\D/g, ''));
  const days = chosen.id === 'semaine' ? 7 : 30;
  const perDay = Math.round(amount / days);
  const title = chosen.id === 'semaine' ? '1 semaine' : '1 mois';
  const faq = [
    ['Comment je reçois ma clé ?', 'Juste après le paiement, ta clé s’affiche sur la page de confirmation et arrive aussi par e-mail. Reviens ici, colle-la : Plus s’active tout de suite.'],
    ['Est-ce que je serai prélevé chaque mois ?', 'Non. Il n’y a aucun prélèvement automatique : tu paies seulement quand tu veux prolonger.'],
    ['Ma clé marche sur un autre téléphone ?', 'Une clé s’active sur un seul téléphone. Garde-la précieusement : elle sert aussi de preuve d’achat.'],
    ['Avec quoi je peux payer ?', (ops.length ? ops.map((m) => m.label).join(', ') + ' ou carte bancaire' : 'Mobile Money ou carte bancaire') + ', sur la page sécurisée de Chariow.']
  ];
  const notice = C.paid ? `<div class="shop-note ok">${icon('check', 16, '#15803D', 2.6)}<span><b>Plus est actif</b> jusqu’au ${until}. Les jours achetés s’ajoutent.</span><button class="link sm" data-act="go" data-arg="abonnement">Voir</button></div>`
    : C.trialOn ? `<div class="shop-note">${img3d('alarm-clock', 20)}<span><b>Essai en cours :</b> encore ${C.hoursLeft} h. Paie maintenant pour garder Plus.</span><button class="link sm" data-act="cancelTrial">Arrêter</button></div>` : '';
  const buy = cta(C.paid ? `Prolonger · ${chosen.price}` : `Payer ${chosen.price}`, 'payChariow', { icon: 'check', sub: link ? 'Mobile Money ou carte · paiement sécurisé' : 'Bientôt disponible', disabled: !link, cls: 'shop-buy', id: 'pay-cta' });

  return `<section class="page shop">
    <header class="shop-top fu d1">
      <button class="round sm" data-act="go" data-arg="home" aria-label="Retour">${icon('back', 20, '#141614', 2)}</button>
      <span class="shop-brand">Mon Assiette <b>Plus</b></span>
      <span class="shop-lock">${icon('lock', 14, '#15803D', 2.4)} Sécurisé</span>
    </header>
    ${notice}

    <div class="shop-hero fu d2">
      <div class="sh-txt"><small>MON ASSIETTE PLUS</small><b>Mange mieux chaque jour, avec Kalou</b>
        <span class="sh-chips"><i>Plan 7 jours</i><i>Courses</i><i>Roue illimitée</i><i>Nutritionniste</i></span></div>
      <div class="sh-kalou">${kalou(chosen.popular ? 'bravo' : 'joie', 120)}</div>
    </div>

    <div class="shop-tabs fu d2" role="tablist">${PLANS.map((p) => `<button class="tap ${p.id === chosen.id ? 'on' : ''}" role="tab" aria-selected="${p.id === chosen.id}" data-act="pickPlan" data-arg="${p.id}"><b>${p.name}</b><small>${p.price}</small>${p.popular ? '<i>Populaire</i>' : ''}</button>`).join('')}</div>

    <div class="shop-info fu d3">
      <h1>Mon Assiette Plus · ${title}</h1>
      <div class="shop-price"><b>${chosen.price.replace(' F', '')}</b><span>F CFA<br><em>${chosen.id === 'semaine' ? 'la semaine' : 'le mois'}</em></span></div>
      <p class="shop-sub">Soit <b>${perDay} F par jour</b> pour manger mieux, chaque jour. ${chosen.popular ? '<em class="hot">Le plus choisi</em>' : ''}</p>
    </div>

    <div class="shop-cta fu d3">
      ${buy}
      ${freshTrial ? `<button class="shop-ghost tap" data-act="startTrial">Essayer 72 h gratuitement d’abord</button>` : ''}
    </div>

    <div class="shop-trust fu d3">
      <span>${icon('lock', 16, '#141614', 2)}<small>Paiement sécurisé</small></span>
      <span>${img3d('sparkles', 18)}<small>Activation immédiate</small></span>
      <span>${icon('check', 16, '#141614', 2.4)}<small>Sans prélèvement</small></span>
    </div>

    <div class="shop-block fu d4">
      <h2>Ce que tu obtiens</h2>
      ${[['spiral-calendar', 'Ton plan de repas sur 7 jours', 'Chaque plat expliqué, adapté à ton bilan et à ton pays'], ['basket', 'Ta liste de courses prête', 'Calculée à partir de ton plan de la semaine'], ['party-popper', 'La roue de Kalou illimitée', 'Tourne autant que tu veux pour choisir quoi préparer'], ['counterclockwise-arrows-button', 'Changer un repas à volonté', 'Une autre idée dès qu’un plat ne te tente pas'], ['stethoscope', 'Une nutritionniste', 'Pose-lui tes questions, réponse sous 48 h']].map((f) => `<div class="shop-feat">${img3d(f[0], 34)}<span><b>${f[1]}</b><small>${f[2]}</small></span></div>`).join('')}
    </div>

    <div class="shop-block key-box fu d4 ${keyOpen ? 'open' : ''}" id="key-box">
      <button class="link-row" data-act="toggleKey"><b>${img3d('sparkles', 20)} Tu as payé ? Active ta clé</b><span>${keyOpen ? '˄' : '›'}</span></button>
      ${keyOpen ? `<form class="stack" data-form="lic">
        <div class="key-row"><input class="field" type="text" value="${esc(C.licKey)}" placeholder="Colle ta clé ici" data-input="licKey" autocapitalize="characters" autocomplete="off" spellcheck="false" maxlength="120" aria-label="Clé d’activation">
          <button type="button" class="chip-btn light tap" data-act="pasteKey">Coller</button></div>
        <button type="submit" class="btn-dark tap" ${C.licBusy ? 'disabled' : ''}>${C.licBusy ? 'Vérification…' : 'Activer ma clé'}</button></form>` : ''}
    </div>

    <div class="shop-block fu d5">
      <h2>Comment ça marche</h2>
      <ol class="shop-steps"><li><i>1</i><span><b>Paie en 1 minute</b><small>Sur la page sécurisée Chariow</small></span></li><li><i>2</i><span><b>Reçois ta clé</b><small>À l’écran et par e-mail</small></span></li><li><i>3</i><span><b>Colle-la ici</b><small>Plus s’ouvre aussitôt</small></span></li></ol>
      <div class="shop-pay">${ops.map((m) => m.logo ? `<span class="acc-logo" title="${m.label}" style="background:${m.color}"><img src="${m.logo}" alt="${m.label}" onerror="this.remove()"></span>` : `<span class="acc-txt">${m.label}</span>`).join('')}<span class="acc-logo card-logo" title="Carte bancaire">${img3d('credit-card', 22)}</span></div>
    </div>

    <div class="shop-block fu d5">
      <h2>Questions fréquentes</h2>
      ${faq.map((q, i) => `<div class="faq ${U.faq === i ? 'open' : ''}"><button class="tap" data-act="faq" data-arg="${i}" aria-expanded="${U.faq === i}">${q[0]}<span>${U.faq === i ? '−' : '+'}</span></button>${U.faq === i ? `<p>${q[1]}</p>` : ''}</div>`).join('')}
    </div>

    <div class="shop-links fu d6">
      <button class="link-row" data-act="toggleCode">Code entreprise ou mutuelle ?<span>${U.showCode ? '˄' : '›'}</span></button>
      ${U.showCode ? `<form class="row" data-form="code"><label for="org-code" class="sr">Code</label><input id="org-code" class="field sm" type="text" value="${esc(U.code)}" placeholder="Ex. DEMO2026" data-input="code" autocapitalize="characters" maxlength="30"><button type="submit" class="btn-dark tap">Valider</button></form>` : ''}
      <button class="link-row" data-act="invite">Inviter un ami<span>›</span></button>
    </div>
    <p class="fine">Prix en F CFA, frais Mobile Money inclus. Conseils généraux de nutrition, qui ne remplacent pas l’avis d’un médecin.</p>
  </section>`;
}

/* ================= La roue de Kalou ================= */
const WCOL = ['#2F8F4E', '#F59E0B', '#F05A3C', '#2563EB', '#7CCB6E', '#FF8A3D', '#0F766E', '#B45309'];
function miniWheel() {
  return `<svg viewBox="0 0 40 40" width="40" height="40">${[0, 1, 2, 3, 4, 5].map((i) => { const a = i * 60, b = a + 60, r = 18, rad = (x) => (x - 90) * Math.PI / 180;
    return `<path d="M20 20 L${20 + r * Math.cos(rad(a))} ${20 + r * Math.sin(rad(a))} A${r} ${r} 0 0 1 ${20 + r * Math.cos(rad(b))} ${20 + r * Math.sin(rad(b))}Z" fill="${WCOL[i]}"/>`; }).join('')}<circle cx="20" cy="20" r="5" fill="#fff"/></svg>`;
}
const WHEEL_SLOTS = ['matin', 'collation', 'midi', 'dessert', 'bienetre', 'soir'];
const WHEEL_TIMES = [[15, '15 min'], [30, '30 min'], [60, '1 h'], [999, 'J’ai le temps']];
export function wheel(S, U, C) {
  const W = U.wheel, slot = W.slot || C.slotNow, { items, relaxed } = C.wheel(slot, W.time === 999 ? 0 : W.time);
  const left = C.wheelLeft(slot), unlimited = C.isPlus, spent = !unlimited && left <= 0;
  const R = 140, cx = 150, cy = 150, rad = (x) => (x - 90) * Math.PI / 180;
  let acc = 0;
  const defs = items.map((_, i) => `<radialGradient id="wg${i}" cx="150" cy="150" r="140" gradientUnits="userSpaceOnUse"><stop offset="0.25" style="stop-color:var(--wseg)"/><stop offset="0.72" stop-color="${WCOL[i % 8]}" style="stop-opacity:var(--wseg-mid)"/><stop offset="1" stop-color="${WCOL[i % 8]}" style="stop-opacity:var(--wseg-edge)"/></radialGradient>`).join('');
  const segs = items.map((m, i) => {
    const a = acc, b = acc + m.share * 360; acc = b;
    const mid = (a + b) / 2, large = b - a > 180 ? 1 : 0;
    const p1 = [cx + R * Math.cos(rad(a)), cy + R * Math.sin(rad(a))], p2 = [cx + R * Math.cos(rad(b)), cy + R * Math.sin(rad(b))];
    const sz = Math.max(30, Math.min(56, (b - a) * 0.9));
    const path = items.length === 1 ? `<circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#wg${i})"/>`
      : `<path d="M${cx} ${cy} L${p1[0].toFixed(2)} ${p1[1].toFixed(2)} A${R} ${R} 0 ${large} 1 ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}Z" fill="url(#wg${i})" style="stroke:var(--wring)" stroke-width="5" stroke-linejoin="round"/>`;
    const badge = m.min ? `${m.min >= 60 ? Math.floor(m.min / 60) + 'h' + (m.min % 60 ? String(m.min % 60).padStart(2, '0') : '') : m.min + '′'}` : '';
    const bw = badge.length * 7 + 14;
    return `${path}<g transform="rotate(${mid.toFixed(1)} ${cx} ${cy})">
      ${faBadge(m.icon || 'pot-of-food', cx - sz / 2, cy - R * 0.76 - sz / 2, sz)}
      ${badge && b - a >= 26 ? `<g transform="translate(${cx} ${(cy - R * 0.5).toFixed(1)})"><rect x="${-bw / 2}" y="-9" width="${bw}" height="18" rx="9" fill="#fff"/><text text-anchor="middle" y="4.5" font-size="11.5" font-weight="700" fill="#141614">${badge}</text></g>` : ''}
    </g>`;
  }).join('');
  const res = W.result;
  const slotLabel = SLOT_INFO[slot].label.toLowerCase();
  const title = W.spinning ? 'La roue tourne…' : res ? 'La roue a choisi !' : spent ? `Tu as utilisé tes tours pour ce ${slotLabel}` : `Que préparer pour ton ${slotLabel} ?`;
  const hub = W.spinning ? '<span class="hub-big">…</span>'
    : spent ? `<small>Prochain tour</small><b id="wheel-count">${C.untilMidnight}</b>`
    : `<span class="hub-big">${W.spins || (!unlimited && left < 4) ? 'Encore' : 'Tourner'}</span>`;
  const info = unlimited ? 'Avec Plus, tu tournes autant que tu veux.'
    : spent ? 'Tu as droit à 1 tour et 3 relances par repas, chaque jour. Choisis un autre moment ou reviens demain.'
    : left === 4 ? 'Chaque jour : 1 tour et 3 relances par repas. Plus une case est grande, plus le plat te fait du bien.'
    : `Encore ${left} relance${left > 1 ? 's' : ''} pour ce ${slotLabel} aujourd’hui.`;
  const ctaBtn = spent
    ? `<button class="wheel-cta tap" data-act="go" data-arg="offers">Tours illimités avec Plus ${img3d('sparkles', 26)}</button>`
    : `<button class="wheel-cta tap" data-act="spin" ${W.spinning ? 'aria-disabled="true"' : ''}>${W.spinning ? 'Ça tourne…' : res ? 'Relancer la roue' : 'Tourner la roue'} ${img3d('sparkles', 26)}</button>`;
  return `<section class="wheel-page">
    <div class="wp-top">
      <button class="wp-close tap" data-act="go" data-arg="home" aria-label="Fermer">${icon('back', 22, '#141614', 2)}</button>
      <small class="wp-kicker">${unlimited ? 'Tours illimités avec Plus' : '1 tour + 3 relances par repas'}</small>
      <span class="wp-spacer"></span>
    </div>
    <h1 class="wp-title">${title}</h1>
    <div class="wp-chips">${WHEEL_SLOTS.map((x) => `<button class="wc tap ${x === slot ? 'on' : ''}" data-act="wheelSlot" data-arg="${x}" aria-pressed="${x === slot}" ${W.spinning ? 'disabled' : ''}>${SLOT_INFO[x].label}</button>`).join('')}</div>
    <div class="wp-chips">${WHEEL_TIMES.map(([v, l]) => `<button class="wc sm tap ${v === W.time ? 'on' : ''}" data-act="wheelTime" data-arg="${v}" aria-pressed="${v === W.time}" ${W.spinning ? 'disabled' : ''}>${img3d('alarm-clock', 14)} ${l}</button>`).join('')}</div>
    ${relaxed ? '<small class="wp-muted">Peu de plats aussi rapides pour ce moment : j’ai mis les plus rapides qui te conviennent.</small>' : ''}
    <div class="wheel-box ${spent ? 'spent' : ''}">
      <svg class="wheel-pointer" viewBox="0 0 60 52" aria-hidden="true"><path d="M8 6 H52 L30 44 Z" fill="rgba(255,210,90,.18)" stroke="#FFD25A" stroke-width="5" stroke-linejoin="round"/></svg>
      <svg class="wheel-svg" viewBox="0 0 300 300" role="img" aria-label="Roue de ${items.length} plats">
        <defs>${defs}</defs>
        <circle cx="150" cy="150" r="149" style="fill:var(--wring)"/>
        <g id="wheel-disc" style="transform:rotate(${W.rot}deg);transform-origin:150px 150px">${segs}</g>
        <circle cx="150" cy="150" r="56" style="fill:var(--wring)"/>
      </svg>
      <button class="spin-hub tap" id="spin-btn" data-act="spin" ${W.spinning || spent ? 'aria-disabled="true"' : ''} aria-label="Tourner la roue">${hub}</button>
    </div>
    ${W.msg && !W.spinning ? `<div class="wp-kalou popnow">${kalou('clin', 58)}<p>${esc(W.msg)}</p></div>` : ''}
    ${res && !W.spinning ? `<div class="wp-res popnow">
      <div class="row"><span class="wp-res-ico">${mealIcon(res, 64)}</span><div class="grow"><small>${SLOT_INFO[slot].label} · ${Math.round(res.share * 100)} % de chances</small><b>${esc(res.name)}</b><em>${esc(res.portion)}</em></div></div>
      ${fiche(res)}
      <div class="wp-why">${res.reasons.map((g) => `<span>${icon('check', 12, '#0B100D', 3)}${esc(g)}</span>`).join('')}</div>
      <div class="row"><button class="btn-gold tap" data-act="wheelPick">${icon('check', 16, '#0B100D', 2.6)} Je le prépare</button><button class="btn-glass tap" data-act="wheelRecipe">${U.open === 'wheel' ? 'Fermer' : 'Recette'}</button></div>
      ${U.open === 'wheel' ? recipeBox(res, 'wheel', U) : ''}
    </div>` : ''}
    <button class="wp-toggle tap" data-act="wheelSkip" role="switch" aria-checked="${!!S.wheelSkip}">Passer l’animation <span class="switch ${S.wheelSkip ? 'on' : ''}"><i></i></span></button>
    <p class="wp-info">${info}</p>
    ${ctaBtn}
    <div class="wp-list"><b>Sur la roue</b>${items.map((m, i) => `<div class="wl"><i style="background:${WCOL[i % 8]}"></i><span class="grow">${esc(m.name)}${m.local ? ' <em class="loc-dot">de chez toi</em>' : ''}</span><small>${m.min ? m.min + ' min · ' : ''}${Math.round(m.share * 100)} %</small></div>`).join('')}
      <small class="wp-muted">Seulement des plats sûrs pour toi : ${S.profile.allergies.length ? 'sans tes allergènes, ' : ''}adaptés à ton bilan${C.country && !C.country.id.startsWith('autre') ? ' et courants ' + esc(C.country.in) : ''}.</small></div>
  </section>`;
}

export const TABS = [['home', 'Accueil', 'home'], ['plan', 'Semaine', 'plan'], ['cook', 'Cuisiner', 'improve'], ['market', 'Courses', 'market'], ['profile', 'Profil', 'profile']];
export function tabbar(screen) {
  return `<nav class="tabbar" aria-label="Navigation principale">${TABS.map((t) => {
    const on = t[0] === screen;
    return `<button class="${on ? 'on' : ''}" data-act="go" data-arg="${t[0]}" aria-label="${t[1]}" ${on ? 'aria-current="page"' : ''}>${icon(t[2], 21, on ? '#0E0E0E' : '#fff', 2)}${on ? `<span>${t[1]}</span>` : ''}</button>`;
  }).join('')}</nav>`;
}
