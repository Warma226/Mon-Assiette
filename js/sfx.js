// Petits effets sonores, synthétisés en direct (aucun fichier audio à télécharger).
// Volume volontairement bas ; coupables depuis le profil.

let ctx = null;
let master = null;
let enabled = true;

function audio() {
  if (!enabled) return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, dur, { type = 'sine', vol = 0.12, to = null, attack = 0.005 } = {}) {
  const c = audio(); if (!c) return;
  const t = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + dur + 0.02);
}

function noise(start, dur, { vol = 0.05, from = 800, to = 3000 } = {}) {
  const c = audio(); if (!c) return;
  const t = c.currentTime + start;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource(); src.buffer = buf;
  const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8;
  f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(master);
  src.start(t); src.stop(t + dur);
}

export const sfx = {
  setEnabled(v) { enabled = !!v; if (!enabled && ctx) ctx.suspend(); },
  unlock() { audio(); },
  // Toucher un bouton : petit clic doux
  tap() { tone(1400, 0, 0.045, { type: 'sine', vol: 0.05, to: 900 }); },
  // Changement d'écran : souffle léger
  swoosh() { noise(0, 0.16, { vol: 0.035, from: 600, to: 2600 }); },
  // Case cochée, choix fait
  tick() { tone(880, 0, 0.06, { type: 'triangle', vol: 0.07 }); tone(1320, 0.04, 0.07, { type: 'triangle', vol: 0.05 }); },
  // Repas noté : petit carillon
  success() { tone(784, 0, 0.18, { type: 'triangle', vol: 0.1 }); tone(1047, 0.09, 0.26, { type: 'triangle', vol: 0.1 }); },
  // Verre d'eau : « bloup »
  water() { tone(320, 0, 0.14, { type: 'sine', vol: 0.16, to: 780 }); tone(900, 0.06, 0.06, { type: 'sine', vol: 0.04 }); },
  // Grande victoire : petit arpège
  celebrate() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.07, 0.3, { type: 'triangle', vol: 0.09 })); noise(0.05, 0.4, { vol: 0.025, from: 3000, to: 8000 }); },
  // Message envoyé / reçu
  send() { tone(600, 0, 0.08, { type: 'sine', vol: 0.08, to: 1100 }); },
  receive() { tone(988, 0, 0.12, { type: 'sine', vol: 0.07 }); tone(1319, 0.08, 0.16, { type: 'sine', vol: 0.06 }); },
  // Action impossible
  error() { tone(220, 0, 0.12, { type: 'square', vol: 0.035 }); tone(180, 0.1, 0.14, { type: 'square', vol: 0.03 }); },
  // Interrupteur
  toggle(on) { tone(on ? 700 : 500, 0, 0.05, { type: 'triangle', vol: 0.06, to: on ? 1000 : 380 }); }
};
