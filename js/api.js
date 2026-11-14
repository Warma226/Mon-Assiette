// Accès à Supabase par l'API REST (PostgREST), sans dépendance.
// Pas de compte à créer : chaque appareil a un identifiant aléatoire envoyé dans l'en-tête x-device-id.
// Les règles de sécurité (RLS) de la base ne laissent chaque appareil voir que ses propres lignes.

import { CONFIG } from './config.js';

function headers(deviceId, extra = {}) {
  return Object.assign({
    apikey: CONFIG.supabaseKey,
    'Content-Type': 'application/json',
    'x-device-id': deviceId
  }, extra);
}

async function request(deviceId, path, opts = {}) {
  if (!navigator.onLine) throw new Error('offline');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(CONFIG.supabaseUrl + '/rest/v1/' + path, {
      method: opts.method || 'GET',
      headers: headers(deviceId, opts.headers),
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: ctrl.signal
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error('HTTP ' + res.status + ' ' + txt.slice(0, 200));
    }
    if (res.status === 204) return null;
    const ct = res.headers.get('content-type') || '';
    return ct.includes('json') ? res.json() : null;
  } finally {
    clearTimeout(timer);
  }
}

export function makeApi(deviceId) {
  const upsert = (table, rows, conflict) => request(deviceId, `${table}?on_conflict=${conflict}`, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: rows
  });
  const rpc = (fn, args = {}) => request(deviceId, 'rpc/' + fn, { method: 'POST', body: args });

  return {
    saveProfile(p) {
      return upsert('ma_profiles', [{
        device_id: deviceId,
        name: (p.name || '').slice(0, 60),
        goal: ['energie', 'equilibre', 'sante', 'poids'].includes(p.goal) ? p.goal : 'equilibre',
        household: '1',
        kids: false,
        budget: [500, 1000, 2000].includes(p.budget) ? p.budget : 2000,
        lang: 'Français',
        notif: p.notif,
        country: ['bf', 'ci', 'sn', 'ml', 'bj', 'tg', 'ne', 'gn', 'autre0', 'autre1'].includes(p.country) ? p.country : null
      }], 'device_id');
    },
    getProfile() {
      return request(deviceId, `ma_profiles?device_id=eq.${encodeURIComponent(deviceId)}&select=*`).then((r) => (r && r[0]) || null);
    },
    saveMeals(rows) {
      if (!rows.length) return Promise.resolve();
      return upsert('ma_meal_logs', rows.map((r) => ({ device_id: deviceId, day: r.day, meal_key: r.key, taken_at: r.at })), 'device_id,day,meal_key');
    },
    deleteMeal(day, key) {
      return request(deviceId, `ma_meal_logs?device_id=eq.${encodeURIComponent(deviceId)}&day=eq.${day}&meal_key=eq.${key}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
    },
    saveWater(rows) {
      if (!rows.length) return Promise.resolve();
      return upsert('ma_water_logs', rows.map((r) => ({ device_id: deviceId, day: r.day, glasses: r.glasses })), 'device_id,day');
    },
    saveImprovement(dish, score, tips) {
      return request(deviceId, 'ma_improvements', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: [{ device_id: deviceId, dish, score, tips }] });
    },
    saveQuestion(question, forExpert) {
      return request(deviceId, 'ma_questions', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: [{ device_id: deviceId, question: question.slice(0, 500), for_expert: !!forExpert }] });
    },
    savePayment(method, phone) {
      return request(deviceId, `ma_profiles?device_id=eq.${encodeURIComponent(deviceId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: { pay_method: method, pay_phone: phone || null } });
    },
    startTrial(plan) { return rpc('ma_start_trial', { p_plan: plan }); },
    cancelTrial() { return rpc('ma_cancel_trial'); },
    redeemCode(code) { return rpc('ma_redeem_code', { p_code: code }); }
  };
}
