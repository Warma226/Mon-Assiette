// Illustrations : Kalou (la mascotte), icônes 3D et icônes de trait.

let uid = 0;

export function kalou(pose = 'joie', size = 120) {
  const id = 'k' + (uid++);
  const up = pose === 'bravo';
  const wink = pose === 'clin';
  const big = pose === 'bravo' || pose === 'clin';
  return `<svg class="kalou" width="${size}" height="${size}" viewBox="0 0 120 120" role="img" aria-label="Kalou, la mascotte">
<defs>
<linearGradient id="${id}b" x1=".2" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="#FFC06A"/><stop offset=".55" stop-color="#F28A2E"/><stop offset="1" stop-color="#D2631A"/></linearGradient>
<linearGradient id="${id}l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A6E59A"/><stop offset="1" stop-color="#2F8F4E"/></linearGradient>
<radialGradient id="${id}s" cx=".3" cy=".25" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="60" cy="113" rx="30" ry="4.5" fill="#000" opacity=".12"/>
${up
    ? `<path d="M24 66 Q10 56 12 40M96 66 Q110 56 108 40" stroke="#E07320" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="12" cy="38" r="6" fill="#F59A3E"/><circle cx="108" cy="38" r="6" fill="#F59A3E"/>`
    : `<path d="M23 74 Q11 78 13 89M97 74 Q109 70 112 60" stroke="#E07320" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="13" cy="90" r="5.5" fill="#F59A3E"/><circle cx="112" cy="58" r="5.5" fill="#F59A3E"/>`}
<path d="M20 64C20 41 38 31 60 31S100 41 100 64C100 92 82 109 60 109S20 92 20 64Z" fill="url(#${id}b)"/>
<path d="M20 64C20 41 38 31 60 31S100 41 100 64C100 92 82 109 60 109S20 92 20 64Z" fill="url(#${id}s)"/>
<path d="M25 52Q60 63 95 52" stroke="#B9540F" stroke-width="3" stroke-linecap="round" fill="none" opacity=".7"/>
<path d="M33 95l6-5 6 5 6-5 6 5 6-5 6 5 6-5 6 5 6-5" stroke="#FFE3B8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".85"/>
<path d="M60 32C60 24 62 18 66 13" stroke="#6B4A1E" stroke-width="4" stroke-linecap="round" fill="none"/>
<g class="kleaf"><path d="M64 17C71 4 91 5 97 11 89 23 72 26 64 17Z" fill="url(#${id}l)"/><path d="M68 16Q80 12 92 11" stroke="#E8FFE0" stroke-width="1.5" stroke-linecap="round" fill="none" opacity=".8"/></g>
${wink
    ? `<path d="M37 68Q46 61 55 68" stroke="#1B1B1B" stroke-width="3.5" stroke-linecap="round" fill="none"/>`
    : `<g class="kblink"><ellipse cx="46" cy="66" rx="10" ry="11.5" fill="#fff"/><circle cx="48" cy="68" r="5.8" fill="#1B1B1B"/><circle cx="50.5" cy="65" r="2.2" fill="#fff"/></g>`}
<g class="kblink"><ellipse cx="74" cy="66" rx="10" ry="11.5" fill="#fff"/><circle cx="76" cy="68" r="5.8" fill="#1B1B1B"/><circle cx="78.5" cy="65" r="2.2" fill="#fff"/></g>
<ellipse cx="35" cy="81" rx="6" ry="3.5" fill="#FF6B5E" opacity=".55"/><ellipse cx="85" cy="81" rx="6" ry="3.5" fill="#FF6B5E" opacity=".55"/>
${big
    ? `<path d="M48 80Q60 98 72 80Z" fill="#5A2A0A"/><ellipse cx="60" cy="89" rx="5.5" ry="3" fill="#FF7A6B"/>`
    : `<path d="M50 81Q60 91 70 81" stroke="#5A2A0A" stroke-width="3.5" stroke-linecap="round" fill="none"/>`}
</svg>`;
}

// Dégradés partagés par les icônes 3D (injectés une seule fois dans la page)
export const SHARED_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="gOrange" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB86A"/><stop offset="1" stop-color="#E4601A"/></linearGradient>
<linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD69A"/><stop offset="1" stop-color="#2E8B57"/></linearGradient>
<linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FB8FF"/><stop offset="1" stop-color="#3256C8"/></linearGradient>
<linearGradient id="gYellow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE68A"/><stop offset="1" stop-color="#E0A000"/></linearGradient>
<linearGradient id="gRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9A8A"/><stop offset="1" stop-color="#D23C2A"/></linearGradient>
<linearGradient id="gLeaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A6E59A"/><stop offset="1" stop-color="#2F8F4E"/></linearGradient>
<linearGradient id="gMango" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE07A"/><stop offset=".6" stop-color="#FFA634"/><stop offset="1" stop-color="#F0602A"/></linearGradient>
<linearGradient id="gCalTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6CB6FF"/><stop offset="1" stop-color="#1F6FE0"/></linearGradient>
<linearGradient id="gCalBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#D8DFE8"/></linearGradient>
<linearGradient id="gStar" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE68A"/><stop offset="1" stop-color="#F59E0B"/></linearGradient>
<linearGradient id="gChat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7DBDFF"/><stop offset="1" stop-color="#2563EB"/></linearGradient>
<linearGradient id="gBasket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDC183"/><stop offset="1" stop-color="#B07A35"/></linearGradient>
<linearGradient id="gRing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1B1F1C"/><stop offset="1" stop-color="#3FA266"/></linearGradient>
<linearGradient id="gDrop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8CC8FF"/><stop offset="1" stop-color="#2563EB"/></linearGradient>
</defs></svg>`;

// Icônes 3D (Fluent Emoji de Microsoft, licence MIT) : voir assets/icons/LICENSE-fluentui-emoji.txt
export function img3d(name, size = 38, alt = '') {
  return `<img class="i3d" src="/assets/icons/${name}.webp" width="${size}" height="${size}" alt="${alt}" loading="lazy" decoding="async" draggable="false">`;
}

// Choisit l'icône d'un plat d'après son nom
export function foodIcon(name) {
  const n = String(name).toLowerCase();
  if (/bouillie/.test(n)) return 'bowl-with-spoon';
  if (/banane/.test(n)) return 'banana';
  if (/orange/.test(n)) return 'tangerine';
  if (/mangue|goyave|papaye|fruit/.test(n)) return 'mango';
  if (/arachides grill/.test(n)) return 'seedling';
  if (/pain/.test(n)) return 'bread';
  if (/attiéké|poisson braisé/.test(n)) return 'fish';
  if (/riz gras|spaghetti/.test(n)) return 'shallow-pan-of-food';
  if (/riz/.test(n)) return 'curry-rice';
  if (/haricot|benga|niébé/.test(n)) return 'bento-box';
  if (/salade|crudit/.test(n)) return 'green-salad';
  return 'pot-of-food';
}

export function food(name, size = 30) { return img3d(foodIcon(name), size); }

export const ICON3D = {
  calendar: img3d('spiral-calendar', 44),
  star: img3d('sparkles', 44),
  basket: img3d('basket', 44),
  chat: img3d('speech-balloon', 44)
};

const PATHS = {
  back: 'M20 12H4M10 18l-6-6 6-6',
  next: 'M9 18l6-6-6-6',
  prev: 'M15 18l-6-6 6-6',
  check: 'M5 12l5 5 9-10',
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0',
  home: 'M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  plan: 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM16 2v4M8 2v4M3 10h18',
  improve: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16v5M16.5 18.5h5',
  market: 'M5 11l1.5 9h11L19 11M3 11h18M8 11l3-7M16 11l-3-7',
  profile: 'M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM4 21a8 8 0 0 1 16 0',
  user: 'M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM4 21a8 8 0 0 1 16 0',
  users: 'M9 7a3 3 0 1 1 0 .1M3 20a6 6 0 0 1 12 0M16 8a2.5 2.5 0 1 1 0 .1M15 14a5 5 0 0 1 6 6',
  family: 'M9 7a3 3 0 1 1 0 .1M17 9a2.5 2.5 0 1 1 0 .1M3 20a6 6 0 0 1 12 0M14 20a4 4 0 0 1 7 0',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
  heart: 'M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z',
  pulse: 'M3 12h4l2-5 4 10 2-5h6',
  scale: 'M12 3v18M5 8h14M7 8l-3 7h6zM17 8l-3 7h6z',
  wallet: 'M3 7h18v10H3zM12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4',
  drop: 'M12 2.7l5.7 5.6a8 8 0 1 1-11.4 0z',
  bowl: 'M3 11h18a9 9 0 0 1-18 0z',
  leaf: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10zM2 21c0-3 1.9-5.4 5.1-6',
  sun: 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  clock: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 7v5l3 2',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  fruit: 'M12 7c-4 0-7 3-7 7s3 7 7 7 7-3 7-7-3-7-7-7zM12 7c0-2 1-4 3-4',
  share: 'M18 8a3 3 0 1 0-3-3M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
  send: 'M5 12h14M13 6l6 6-6 6',
  sliders: 'M4 7h10M18 7h2M4 17h4M12 17h8M16 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM10 15a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
  speaker: 'M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14',
  download: 'M12 3v12M7 10l5 5 5-5M5 21h14',
  lock: 'M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4'
};

export function icon(name, size = 22, color = 'currentColor', width = 1.9) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${PATHS[name] || ''}"/></svg>`;
}

export const BELL_FILLED = img3d('bell', 30);

/* ---------- Drapeaux (dessinés en SVG, proportions 3:2) ---------- */
const star = (cx, cy, r, fill) => {
  const pts = [...Array(10)].map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.4 : r; return `${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`; }).join(' ');
  return `<polygon points="${pts}" fill="${fill}"/>`;
};
const vbands = (c) => c.map((col, i) => `<rect x="${i}" y="0" width="1.01" height="2" fill="${col}"/>`).join('');
const FLAGS = {
  bf: `<rect width="3" height="1" fill="#EF2B2D"/><rect y="1" width="3" height="1" fill="#009E49"/>${star(1.5, 1, 0.34, '#FCD116')}`,
  ci: vbands(['#F77F00', '#FFFFFF', '#009E60']),
  sn: vbands(['#00853F', '#FDEF42', '#E31B23']) + star(1.5, 1, 0.3, '#00853F'),
  ml: vbands(['#14B53A', '#FCD116', '#CE1126']),
  bj: `<rect width="1.2" height="2" fill="#008751"/><rect x="1.2" width="1.8" height="1" fill="#FCD116"/><rect x="1.2" y="1" width="1.8" height="1" fill="#E8112D"/>`,
  tg: [0, 1, 2, 3, 4].map((i) => `<rect y="${i * 0.4}" width="3" height="0.41" fill="${i % 2 ? '#FFCE00' : '#006A4E'}"/>`).join('') + `<rect width="1.2" height="1.2" fill="#D21034"/>${star(0.6, 0.6, 0.38, '#FFFFFF')}`,
  ne: `<rect width="3" height="0.67" fill="#E05206"/><rect y="0.66" width="3" height="0.68" fill="#FFFFFF"/><rect y="1.33" width="3" height="0.67" fill="#0DB02B"/><circle cx="1.5" cy="1" r="0.2" fill="#E05206"/>`,
  gn: vbands(['#CE1126', '#FCD116', '#009460'])
};
export function flag(id, w = 30) {
  const h = Math.round(w * 2 / 3);
  if (!FLAGS[id]) return `<span class="flag globe" style="width:${w}px;height:${h}px">🌍</span>`;
  return `<svg class="flag" width="${w}" height="${h}" viewBox="0 0 3 2" aria-hidden="true">${FLAGS[id]}</svg>`;
}
