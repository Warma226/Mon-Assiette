// État local (fonctionne hors connexion) + file de synchronisation vers Supabase.
import { DEFAULT_PROFILE } from './engine.js';

const KEY = 'mon-assiette:v1';

function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function fresh() {
  return {
    v: 1,
    deviceId: uuid(),
    onboarded: false,
    profile: JSON.parse(JSON.stringify(DEFAULT_PROFILE)),
    sound: true,
    swaps: {}, picks: {},
    missions: {},
    trial: null,
    pay: { method: 'orange', phone: '' },
    orgCode: null,
    meals: {},
    water: {},
    improvements: [],
    bought: {},
    chat: [],
    tip: 0,
    profileSynced: false,
    pending: []
  };
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    const s = JSON.parse(raw);
    if (!s || s.v !== 1 || !s.deviceId) return fresh();
    const f = fresh();
    const prof = Object.assign(f.profile, s.profile || {});
    prof.habits = Object.assign({}, DEFAULT_PROFILE.habits, (s.profile || {}).habits || {});
    ['conditions', 'allergies'].forEach((k) => { if (!Array.isArray(prof[k])) prof[k] = []; });
    return Object.assign(f, s, { profile: prof });
  } catch (e) {
    return fresh();
  }
}

export function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* stockage plein : on continue en mémoire */ }
}

export function wipe() {
  try { localStorage.removeItem(KEY); } catch (e) {}
}

// Opérations en attente : { t: 'profile' | 'meal' | 'unmeal' | 'water' | 'improve' | 'question' | 'pay', ... }
export function enqueue(state, op) {
  if (op.t === 'profile') {
    state.pending = state.pending.filter((p) => p.t !== 'profile');
    state.pending.unshift(op);
  } else if (op.t === 'water') {
    state.pending = state.pending.filter((p) => !(p.t === 'water' && p.day === op.day));
    state.pending.push(op);
  } else if (op.t === 'meal' || op.t === 'unmeal') {
    state.pending = state.pending.filter((p) => !((p.t === 'meal' || p.t === 'unmeal') && p.day === op.day && p.key === op.key));
    state.pending.push(op);
  } else {
    state.pending.push(op);
  }
  if (state.pending.length > 300) state.pending = state.pending.slice(-300);
}

let flushing = false;
export async function flush(state, api, onDone) {
  if (flushing || !navigator.onLine || !state.onboarded) return;
  flushing = true;
  try {
    if (!state.profileSynced || state.pending.some((p) => p.t === 'profile')) {
      await api.saveProfile(state.profile);
      state.profileSynced = true;
      state.pending = state.pending.filter((p) => p.t !== 'profile');
    }
    while (state.pending.length) {
      const op = state.pending[0];
      if (op.t === 'meal') await api.saveMeals([{ day: op.day, key: op.key, at: op.at }]);
      else if (op.t === 'unmeal') await api.deleteMeal(op.day, op.key);
      else if (op.t === 'water') await api.saveWater([{ day: op.day, glasses: op.glasses }]);
      else if (op.t === 'improve') await api.saveImprovement(op.dish, op.score, op.tips);
      else if (op.t === 'question') await api.saveQuestion(op.text, op.expert);
      else if (op.t === 'pay') await api.savePayment(op.method, op.phone);
      state.pending.shift();
    }
  } catch (e) {
    // Réseau instable : on réessaiera plus tard, rien n'est perdu.
    console.warn('[sync]', e.message);
  } finally {
    flushing = false;
    save(state);
    if (onDone) onDone();
  }
}
