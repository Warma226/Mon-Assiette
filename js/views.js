// Écrans de Mon Assiette. Chaque fonction renvoie du HTML ; les actions passent par data-act.

import { kalou, img3d, icon } from './art.js';
import {
  SLIDES, SEXES, AGES, ACTIVITIES, GOALS, CONDITIONS, PREGNANCY, ALLERGENS, DIETS, HABITS,
  DISHES, SLOT_INFO, SLOT_WHY, NUTRIENTS, TAG_BENEFIT, HOW, PANTRY, seasonFor, CHAT_CHIPS,
  PLANS, PLAN_NAMES, FEATURES, PAYMENTS, APPETITE_TIPS
} from './content.js';

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
const STEPS = [
  { title: "Comment tu t'appelles ?", hint: 'Ta consultation avec Kalou : 7 petites étapes, 2 minutes.' },
  { title: 'Parle-moi un peu de toi', hint: 'Les besoins changent selon l’âge, le sexe et l’activité.' },
  { title: 'Ton poids et ta taille ?', hint: 'Facultatif. Ça m’aide à mieux te conseiller. Rien n’est partagé.' },
  { title: 'Qu’est-ce que tu veux améliorer ?', hint: 'Ton objectif principal.' },
  { title: 'Ta santé', hint: 'Coche ce qui te concerne. Tes réponses restent sur ton téléphone.' },
  { title: 'Allergies et régime', hint: 'Les aliments concernés seront retirés de tous tes menus.' },
  { title: 'Tes habitudes', hint: 'Sois honnête : c’est pour t’aider, pas pour te juger.' }
];
export const SETUP_STEPS = STEPS.length;

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
    body = `<span class="lbl">Tu es</span>${pills(SEXES, d.sex, 'setSex')}
      <span class="lbl">Ton âge</span>${pills(AGES, d.age, 'setAge')}
      <span class="lbl">Ta journée</span>${ACTIVITIES.map((o) => opt(o, d.activity === o.id, 'setActivity', null)).join('')}`;
  } else if (step === 2) {
    body = `<div class="grid2">
        <label class="num"><span>Poids</span><input type="number" inputmode="decimal" min="25" max="250" value="${d.weight || ''}" placeholder="—" data-input="weight"><em>kg</em></label>
        <label class="num"><span>Taille</span><input type="number" inputmode="numeric" min="120" max="220" value="${d.height || ''}" placeholder="—" data-input="height"><em>cm</em></label>
      </div>
      <small class="muted">Tu ne sais pas ? Laisse vide et continue.</small>`;
  } else if (step === 3) {
    body = GOALS.map((o) => opt(o, d.goal === o.id, 'setGoal', o.icon)).join('');
  } else if (step === 4) {
    const fertile = d.sex === 'f' && ['13-17', '18-34', '35-59'].includes(d.age);
    body = CONDITIONS.map((o) => opt(o, d.conditions.includes(o.id), 'toggleCond', null, true)).join('') +
      `<button class="opt tap ${!d.conditions.length ? 'on' : ''}" data-act="noCond" aria-pressed="${!d.conditions.length}"><span class="opt-txt"><b>Rien de tout ça</b></span><span class="opt-radio">${icon('check', 12, '#fff', 3.4)}</span></button>` +
      (fertile ? `<span class="lbl" style="margin-top:6px">Enceinte ou allaitante ?</span>${pills(PREGNANCY, d.pregnancy, 'setPreg')}` : '');
  } else if (step === 5) {
    body = `<div class="allergy-grid">${ALLERGENS.map((a) => {
      const on = d.allergies.includes(a.id);
      return `<button class="allergy tap ${on ? 'on' : ''}" data-act="toggleAllergy" data-arg="${a.id}" aria-pressed="${on}">${img3d(a.icon, 40)}<span>${a.label}</span></button>`;
    }).join('')}</div>
      <button class="opt tap ${!d.allergies.length ? 'on' : ''}" data-act="noAllergy" aria-pressed="${!d.allergies.length}"><span class="opt-txt"><b>Aucune allergie</b></span><span class="opt-radio">${icon('check', 12, '#fff', 3.4)}</span></button>
      <span class="lbl" style="margin-top:6px">Ton régime</span>${pills(DIETS, d.diet, 'setDiet')}`;
  } else {
    body = HABITS.map((h) => `<div class="habit"><b>${h.q}</b><div class="pills">${h.opts.map((o) => {
      const on = d.habits[h.id] === o[0];
      return `<button class="pl tap ${on ? 'on' : ''}" data-act="setHabit" data-arg="${h.id}:${o[0]}" aria-pressed="${on}">${o[1]}</button>`;
    }).join('')}</div></div>`).join('');
  }
  const disabled = (step === 0 && !d.name.trim()) || (step === 1 && (!d.sex || !d.age));
  const n = STEPS.length;
  return `<section class="setup">
    <div class="setup-top">
      <button class="round" data-act="setupBack" aria-label="Retour">${icon('back', 20, '#141614', 1.8)}</button>
      <div class="segs" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${step + 1}" aria-label="Progression">${STEPS.map((_, i) => `<span><i style="width:${i < step ? 100 : i === step ? 50 : 0}%"></i></span>`).join('')}</div>
      <span class="muted">${step + 1}/${n}</span>
    </div>
    <div class="ask"><div class="ask-kalou">${kalou(step === n - 1 ? 'bravo' : step % 2 ? 'clin' : 'joie', 88)}</div><div class="ask-bubble popnow"><b>${q.title}</b><small>${q.hint}</small></div></div>
    <div class="setup-body">${body}</div>
    ${cta(step < n - 1 ? 'Continuer' : (U.editing ? 'Mettre à jour mon bilan' : 'Voir mon bilan'), 'setupNext', { disabled, id: 'setup-cta' })}
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
  const p = S.profile, A = C.A, now = new Date();
  const hour = now.getHours();
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
      ${img3d(theme.icon, 40)}<span><small>${longDate(now)}</small><b>${theme.title}</b></span>${icon('next', 16, '#2C7546', 2)}
    </button>

    ${hero ? `<div class="hero-meal fu d2">
      <div class="hm-top"><span class="hm-when">${hero.when}</span><span class="hm-slot">${SLOT_INFO[hero.slot].label} · ${SLOT_INFO[hero.slot].time}</span></div>
      <div class="hm-main">
        <div class="hm-img">${mealIcon(hero, 84)}</div>
        <div class="hm-txt"><small>Idéal pour toi ${hero.isNow ? 'maintenant' : 'à ' + SLOT_INFO[hero.slot].time}</small><b>${esc(hero.name)}</b><em>${esc(hero.portion)}</em></div>
      </div>
      <p class="hm-why"><b>Pourquoi maintenant ?</b> ${SLOT_WHY[hero.slot]}</p>
      <div class="gives"><small>Ce repas t'apporte</small>${hero.gives.map((g) => `<span>${icon('check', 12, '#15803D', 3)}${g}</span>`).join('')}</div>
      <div class="hm-actions">
        <button class="btn-dark tap" data-act="eat" data-arg="${hero.slot}">${icon('check', 16, '#fff', 2.6)} Je le mange</button>
        <button class="chip-btn light tap" data-act="recipe" data-arg="0:${hero.slot}">Recette</button>
        <button class="chip-btn light tap" data-act="swap" data-arg="0:${hero.slot}">${icon('improve', 14, '#3C433D', 2)} Autre idée</button>
      </div>
      ${U.open === '0:' + hero.slot ? recipeBox(hero) : ''}
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

    <div class="quick fu d5">
      <button class="qa" data-act="go" data-arg="plan"><span>${img3d('spiral-calendar', 44)}</span>Ma semaine</button>
      <button class="qa" data-act="go" data-arg="cook"><span>${img3d('pot-of-food', 44)}</span>Cuisiner</button>
      <button class="qa" data-act="go" data-arg="market"><span>${img3d('basket', 44)}</span>Courses</button>
      <button class="qa" data-act="go" data-arg="chat"><span>${img3d('speech-balloon', 44)}</span>Kalou</button>
    </div>

    <div class="tip-row fu d5">
      <div class="tip-kalou">${kalou('clin', 88)}</div>
      <div class="tip-bubble"><small>Le conseil de Kalou pour toi</small><p class="popnow">${esc(C.tip())}</p>
        <div class="row"><button class="chip-btn light" data-act="nextTip">Autre conseil</button><button class="chip-btn light" data-act="speak" aria-label="Écouter le conseil">${img3d('speaker-high-volume', 16)} Écouter</button></div></div>
    </div>

    ${!C.isPlus ? `<button class="promo tap fu d6" data-act="go" data-arg="offers"><span><small>MON ASSIETTE PLUS</small><b>${C.trialUsed ? 'Passe à Plus' : 'Essaie Plus gratuitement 72 h'}</b><em>Ta semaine complète, ta liste de courses, une nutritionniste.</em></span><i>${icon('next', 18, '#0E0E0E', 2.2)}</i></button>` : ''}
    <p class="fine">Conseils généraux qui ne remplacent pas l'avis d'un médecin.</p>
  </section>`;
}

function recipeBox(m) {
  const steps = HOW[m.id] || [];
  return `<div class="recipe popnow"><b>Comment le préparer</b><ol>${steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
    ${m.ing && m.ing.length ? `<small class="muted">Il te faut : ${m.ing.map(esc).join(', ')}.</small>` : ''}</div>`;
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
    <div class="why-chips">${m.reasons.map((r) => `<span>${esc(r)}</span>`).join('')}</div>
    <div class="mc-actions"><button class="link sm" data-act="recipe" data-arg="${k}">${U.open === k ? 'Fermer' : 'Recette'}</button><button class="link sm" data-act="swap" data-arg="${k}">Autre idée</button>${m.takenAt ? `<small class="ok-txt">Mangé à ${m.takenAt}</small>` : ''}</div>
    ${U.open === k ? recipeBox(m) : ''}
  </div>`;
}

/* ================= Cuisiner ================= */
export function cook(S, U, C) {
  const tab = U.cookTab;
  return `<section class="page">
    ${header('Cuisiner')}
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
    <div class="why-chips">${m.reasons.map((r) => `<span>${esc(r)}</span>`).join('')}</div>
    <div class="mc-actions"><button class="link sm" data-act="recipe" data-arg="cook:${i}">${U.open === 'cook:' + i ? 'Fermer' : 'Recette'}</button></div>
    ${U.open === 'cook:' + i ? recipeBox(m) : ''}</div>`).join('')}`;
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
    <div class="card stack fu d4"><div class="row">${img3d('seedling', 30)}<b>De saison en ce moment</b></div><div class="tags">${seasonFor(new Date().getMonth() + 1).map((s) => `<span>${s}</span>`).join('')}</div><small class="muted">Plus frais, plus savoureux. À adapter selon ta région.</small></div>
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
      ${msgs.map((m) => `<div class="msg ${m.from === 'me' ? 'me' : ''}">${esc(m.text)}</div>`).join('')}
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
    <div class="card-hero fu d2"><span class="avatar xl">${esc(initials)}</span><div class="grow"><b class="h2">${esc(p.name)}</b><small class="muted">${C.A.priorities.map((x) => x.title).join(' · ')}</small>${C.isPlus ? pill('Essai Plus actif', 'dark') : pill('Formule gratuite', 'plan')}</div></div>
    <div class="card list fu d3">
      <button class="li tap" data-act="go" data-arg="bilan"><span class="row">${img3d('clipboard', 28)}<b>Mon bilan nutritionnel</b></span>›</button>
      <button class="li tap" data-act="editProfile"><span class="row">${img3d('counterclockwise-arrows-button', 28)}<b>Refaire mon bilan</b></span>›</button>
      <button class="li tap" data-act="toggleSound" role="switch" aria-checked="${S.sound}"><span class="row">${img3d(S.sound ? 'speaker-high-volume' : 'muted-speaker', 28)}<b>Sons</b></span><span class="switch ${S.sound ? 'on' : ''}"><i></i></span></button>
    </div>
    <div class="card fu d3 stack ${C.isPlus ? 'dark' : ''}">
      <small class="kicker">ABONNEMENT</small>
      <b class="h3">${C.isPlus ? PLAN_NAMES[S.trial.plan] + ' · essai gratuit' : C.orgName ? 'Accès offert par ' + esc(C.orgName) : 'Formule gratuite'}</b>
      <small>${C.isPlus ? `Il te reste ${C.hoursLeft} h d'essai. Aucun paiement pendant l'essai.` : C.trialUsed ? 'Ton essai est terminé. Le paiement Mobile Money arrive bientôt.' : 'Bilan, plan du jour, défis et suivi sont gratuits.'}</small>
      ${C.isPlus ? `<div class="thin-bar light"><div style="width:${Math.round(C.hoursLeft / 72 * 100)}%"></div></div><div class="row"><button class="btn-light tap" data-act="go" data-arg="offers">Changer de formule</button><button class="btn-ghost tap" data-act="cancelTrial">Arrêter l'essai</button></div>`
      : `<button class="btn-dark tap" data-act="go" data-arg="offers">${C.trialUsed ? 'Voir les offres' : 'Essayer Plus 72 h gratuit'}</button>`}
    </div>
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
    <p class="fine">Mon Assiette · version 2.0 · Icônes Fluent Emoji (Microsoft, licence MIT)</p>
  </section>`;
}

/* ================= Offres ================= */
function payTile(m, on) {
  const inner = m.logo
    ? `<span class="pay-logo" style="background:${m.color};color:${m.ink}">${img3d('mobile-phone', 26)}<img class="brand" src="${m.logo}" alt="${m.label}" onerror="this.remove()"></span>`
    : `<span class="pay-logo" style="background:${m.color}">${img3d(m.icon, 30)}</span>`;
  return `<button class="pay tap ${on ? 'on' : ''}" data-act="pickPay" data-arg="${m.id}" aria-pressed="${on}">${inner}<span>${m.label}</span></button>`;
}
export function offers(S, U, C) {
  const chosen = PLANS.find((p) => p.id === U.offerPlan) || PLANS[1];
  const payment = PAYMENTS.find((x) => x.id === U.pay) || PAYMENTS[0];
  const digits = (U.phone || '').replace(/\D/g, '');
  const phoneOk = !payment.phone || digits.length === 8;
  const canTrial = !C.trialUsed || C.isPlus;
  return `<section class="page">
    ${header('Mon Assiette <span class="green">Plus</span>')}
    <div class="promo hero fu d2"><div class="promo-kalou">${kalou('bravo', 108)}</div>
      <span><small class="tag">${canTrial ? 'ESSAI GRATUIT' : 'BIENTÔT'}</small><b>${canTrial ? '72 heures offertes' : 'Paiement Mobile Money'}</b><em>${canTrial ? "Rien à payer aujourd'hui. Tu arrêtes en un clic." : 'Ton essai est terminé. Laisse ton numéro : on te prévient dès l’ouverture.'}</em></span></div>
    ${C.isPlus ? `<div class="card dark stack popnow"><b class="h3">Ton essai ${PLAN_NAMES[S.trial.plan]} est actif</b><small>Il te reste ${C.hoursLeft} h.</small><button class="btn-ghost tap" data-act="cancelTrial">Arrêter l'essai</button></div>` : ''}
    <div class="fu d3 stack">${PLANS.map((p) => `<button class="plan tap ${p.id === chosen.id ? 'on' : ''}" data-act="pickPlan" data-arg="${p.id}" aria-pressed="${p.id === chosen.id}"><span class="radio"><i></i></span><span class="grow"><b>${p.name}</b><small>${p.desc}</small></span><span class="price"><b>${p.price}</b><small>${p.per}</small></span>${p.popular ? '<span class="ribbon">Le plus choisi</span>' : ''}</button>`).join('')}</div>
    <div class="card fu d4 feat"><div class="feat-row head"><span>Ce qui est inclus</span><span>Gratuit</span><span class="green">Plus</span></div>
      ${FEATURES.map((f) => `<div class="feat-row"><span>${f[0]}</span><span class="${f[1] === '—' ? 'no' : 'yes'}">${f[1]}</span><span class="yes b">${f[2]}</span></div>`).join('')}</div>
    <div class="fu d5 stack">
      <span class="lbl">Payer avec ${canTrial ? "(après l'essai)" : ''}</span>
      <div class="pays">${PAYMENTS.map((m) => payTile(m, m.id === payment.id)).join('')}</div>
      ${payment.phone ? `<label for="pay-phone" class="lbl">Ton numéro ${payment.label}</label>
        <div class="phone ${digits.length === 0 ? '' : phoneOk ? 'ok' : 'warn'}"><span>+226</span><input id="pay-phone" type="tel" inputmode="numeric" value="${esc(U.phone)}" placeholder="70 00 00 00" maxlength="11" data-input="phone" autocomplete="tel-national"></div>
        <small class="muted" id="phone-hint">${digits.length === 0 ? '8 chiffres. Aucun paiement maintenant.' : phoneOk ? 'Numéro valide.' : 'Encore ' + (8 - digits.length) + ' chiffre(s).'}</small>`
      : '<small class="muted">La carte sera demandée de façon sécurisée, seulement si tu continues après l’essai.</small>'}
    </div>
    <div class="fu d6 stack">
      ${canTrial ? cta(C.isPlus ? 'Passer à la formule ' + chosen.name : "Commencer l'essai gratuit", 'startTrial', { pulse: true, sub: 'puis ' + chosen.price + ' ' + chosen.per + ' · sans engagement', disabled: !phoneOk, id: 'trial-cta' })
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

export const TABS = [['home', 'Accueil', 'home'], ['plan', 'Semaine', 'plan'], ['cook', 'Cuisiner', 'improve'], ['market', 'Courses', 'market'], ['profile', 'Profil', 'profile']];
export function tabbar(screen) {
  return `<nav class="tabbar" aria-label="Navigation principale">${TABS.map((t) => {
    const on = t[0] === screen;
    return `<button class="${on ? 'on' : ''}" data-act="go" data-arg="${t[0]}" aria-label="${t[1]}" ${on ? 'aria-current="page"' : ''}>${icon(t[2], 21, on ? '#0E0E0E' : '#fff', 2)}${on ? `<span>${t[1]}</span>` : ''}</button>`;
  }).join('')}</nav>`;
}
