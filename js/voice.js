// Voix de Kalou : choisit la voix française la plus naturelle du téléphone
// et lit le texte phrase par phrase, avec un rythme plus humain.

const ok = typeof window !== 'undefined' && 'speechSynthesis' in window;
let chosenURI = null;
let onChange = () => {};

// Voix « naturelles » connues (Android, iOS, Windows, Chrome, Edge)
const GOOD = /(natural|neural|online|premium|enhanced|amélie|amelie|audrey|aurélie|aurelie|thomas|denise|henri|eloise|vivienne|remy|rémy|marie|julie|paul|google)/i;
const BAD = /(compact|espeak|eloquence|grandma|grandpa|rocko|shelley|sandy|flo|reed|eddy|jacques)/i;

function scoreVoice(v) {
  let s = 0;
  if (/natural|neural/i.test(v.name)) s += 60;
  if (/premium|enhanced/i.test(v.name)) s += 45;
  if (/online/i.test(v.name)) s += 35;
  if (/google/i.test(v.name)) s += 30;
  if (GOOD.test(v.name)) s += 15;
  if (BAD.test(v.name)) s -= 40;
  if (!v.localService) s += 8;
  if (/^fr[-_]FR/i.test(v.lang)) s += 6;
  return s;
}

export function voices() {
  if (!ok) return [];
  const fr = speechSynthesis.getVoices().filter((v) => /^fr/i.test(v.lang)).sort((a, b) => scoreVoice(b) - scoreVoice(a));
  const good = fr.filter((v) => !BAD.test(v.name));
  return good.length ? good : fr;
}
export function bestVoice() {
  const list = voices();
  return list.find((v) => v.voiceURI === chosenURI) || list[0] || null;
}
export function prettyName(v) {
  const n = v.name.replace(/Microsoft |Google |\(.*?\)| - .*$/g, '').replace(/Online|Natural/gi, '').trim();
  const where = /CA/.test(v.lang) ? ' · Canada' : /BE/.test(v.lang) ? ' · Belgique' : /CH/.test(v.lang) ? ' · Suisse' : '';
  const q = /natural|neural|premium|enhanced/i.test(v.name) ? ' · très naturelle' : /online|google/i.test(v.name) ? ' · naturelle' : '';
  return (n || 'Voix française') + where + q;
}
export function setVoice(uri) { chosenURI = uri || null; }
export function supported() { return ok; }
export function onVoices(fn) { onChange = fn; if (ok) speechSynthesis.addEventListener?.('voiceschanged', () => onChange()); }

// Rend le texte agréable à l'oreille : abréviations, heures, fractions, prix
export function humanize(t) {
  return String(t)
    .replace(/(\d)[\s\u202f\u00a0](\d{3})\b/g, '$1$2')
    .replace(/•/g, '. ')
    .replace(/\n+/g, '. ')
    .replace(/(\d{1,2}):00\b/g, '$1 heures')
    .replace(/(\d{1,2}):(\d{2})\b/g, '$1 heures $2')
    .replace(/(\d{1,2}) ?h ?(\d{2})\b/g, '$1 heures $2')
    .replace(/(\d{1,2}) ?h\b/g, '$1 heures')
    .replace(/½/g, 'une demi').replace(/¼/g, 'un quart').replace(/¾/g, 'trois quarts')
    .replace(/F CFA/g, 'francs CFA').replace(/(\d) ?F\b/g, '$1 francs')
    .replace(/(\d) ?%/g, '$1 pour cent')
    .replace(/(\d) ?min\b/g, '$1 minutes')
    .replace(/(\d) ?kg\b/g, '$1 kilos').replace(/(\d) ?cm\b/g, '$1 centimètres')
    .replace(/\bIMC\b/g, 'indice de masse corporelle')
    .replace(/\s*\+\s*/g, ' et ')
    .replace(/[«»"]/g, '')
    .replace(/([.!?:])\s*\.(\s*\.)*/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/* ---------- Voix premium (synthèse neuronale sur le serveur) ---------- */
export const CLOUD_VOICES = [
  { id: 'denise', label: 'Denise', desc: 'Femme · chaleureuse' },
  { id: 'henri', label: 'Henri', desc: 'Homme · posé' },
  { id: 'vivienne', label: 'Vivienne', desc: 'Femme · douce' },
  { id: 'remy', label: 'Rémy', desc: 'Homme · dynamique' }
];
const cloud = { url: null, key: null, device: null, voice: 'denise', off: false };
export function setCloud(o) { Object.assign(cloud, o); }
export function cloudVoice() { return cloud.off ? null : CLOUD_VOICES.find((v) => v.id === cloud.voice) || null; }
export function cloudOff() { return cloud.off; }
// Vérifie au démarrage que les voix humaines sont branchées sur le serveur
export async function probe() {
  if (!cloud.url || !navigator.onLine) return;
  try {
    const r = await fetch(cloud.url, { method: 'POST', headers: { 'content-type': 'application/json', apikey: cloud.key, 'x-device-id': cloud.device }, body: '{}' });
    cloud.off = r.status === 503 || r.status === 404;
  } catch (e) { /* hors ligne : on réessaiera */ }
}
const memo = new Map();
const hashStr = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36) + s.length; };
async function cloudAudio(text) {
  const k = cloud.voice + '|' + text;
  if (memo.has(k)) return memo.get(k);
  const cacheKey = `${cloud.url}?v=${cloud.voice}&h=${hashStr(text)}`;
  try { const hit = await (await caches.open('ma-voix-v1')).match(cacheKey); if (hit) { const u = URL.createObjectURL(await hit.blob()); memo.set(k, u); return u; } } catch (e) { /* pas de cache */ }
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 9000);
  const r = await fetch(cloud.url, { method: 'POST', headers: { 'content-type': 'application/json', apikey: cloud.key, 'x-device-id': cloud.device }, body: JSON.stringify({ text, voice: cloud.voice }), signal: ctl.signal });
  clearTimeout(t);
  if (r.status === 503) { cloud.off = true; throw new Error('off'); }
  if (!r.ok) throw new Error('tts ' + r.status);
  const blob = await r.blob();
  try { await (await caches.open('ma-voix-v1')).put(cacheKey, new Response(blob, { headers: { 'Content-Type': 'audio/mpeg' } })); } catch (e) { /* pas de cache */ }
  const u = URL.createObjectURL(blob); memo.set(k, u); return u;
}
// Découpe un long texte en morceaux de phrases entières
function chunks(t, max = 1300) {
  const out = []; let cur = '';
  t.split(/(?<=[.!?…])\s+/).forEach((p) => { if ((cur + ' ' + p).length > max && cur) { out.push(cur); cur = p; } else cur = cur ? cur + ' ' + p : p; });
  if (cur) out.push(cur); return out;
}
let player = null;
async function sayCloud(text, id, onEnd) {
  const parts = chunks(humanize(text));
  let next = cloudAudio(parts[0]);
  for (let i = 0; i < parts.length; i++) {
    const url = await next;
    if (id !== speakingId) return true;
    if (i + 1 < parts.length) next = cloudAudio(parts[i + 1]);
    await new Promise((res, rej) => {
      player = new Audio(url); player.onended = res; player.onerror = rej;
      player.play().catch(rej);
    });
    if (id !== speakingId) return true;
  }
  if (onEnd) onEnd();
  return true;
}

let speakingId = 0;
export function stop() { if (ok) speechSynthesis.cancel(); if (player) { player.pause(); player = null; } speakingId++; }
export function isSpeaking() { return ok && speechSynthesis.speaking; }

// Lit phrase par phrase : petites pauses naturelles, et évite la coupure des longs textes sur Chrome
export function say(text, { onEnd } = {}) {
  stop();
  const id = speakingId;
  if (cloud.url && cloud.voice && !cloud.off && navigator.onLine) {
    sayCloud(text, id, onEnd).catch(() => { if (id === speakingId) sayLocal(text, id, onEnd); });
    return true;
  }
  return sayLocal(text, id, onEnd);
}
function sayLocal(text, id, onEnd) {
  if (!ok) { if (onEnd) onEnd(); return false; }
  const v = bestVoice();
  const parts = humanize(text).split(/(?<=[.!?…:;])\s+/).map((s) => s.trim()).filter(Boolean);
  const natural = v && /natural|neural|premium|enhanced|online|google/i.test(v.name);
  parts.forEach((p, i) => {
    const u = new SpeechSynthesisUtterance(p);
    try { if (v) u.voice = v; } catch (e) { /* voix indisponible : voix par défaut */ }
    u.lang = v ? v.lang : 'fr-FR';
    // Les voix de base sonnent moins robotiques un peu plus lentes et légèrement plus chaudes
    u.rate = natural ? 1.0 : 0.92 + (i % 3) * 0.02;
    u.pitch = natural ? 1.0 : 1.04;
    if (i === parts.length - 1) u.onend = () => { if (id === speakingId && onEnd) onEnd(); };
    speechSynthesis.speak(u);
  });
  return true;
}
