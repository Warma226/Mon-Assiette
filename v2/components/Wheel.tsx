'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DishImage } from './ui';

type D = { id: string; slug: string; name: string; image_url: string | null; category_id: string; moments: string[] };
const COLS = ['#6C3CF0', '#FFB020', '#047857', '#D9381E', '#8E6CF5', '#FF8A3D', '#0F766E', '#B45309'];
const FREE_SPINS = 3;

export function Wheel({ categories, initialCategory, dishes, unlimited, day }: { categories: { id: string; name: string }[]; initialCategory: string; dishes: D[]; unlimited: boolean; day: string }) {
  const [cat, setCat] = useState(initialCategory);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<D | null>(null);
  const [used, setUsed] = useState(0);
  const key = `ma2:roue:${day}:${cat}`;

  useEffect(() => {
    try {
      setUsed(Number(localStorage.getItem(key)) || 0);
    } catch {}
    setWinner(null);
  }, [key]);

  const items = useMemo(() => {
    const list = dishes.filter((d) => d.moments.includes(cat) || d.category_id === cat);
    return (list.length >= 2 ? list : dishes).slice(0, 8);
  }, [dishes, cat]);
  const n = items.length;
  const left = unlimited ? Infinity : Math.max(0, FREE_SPINS - used);

  function spin() {
    if (spinning || !n || left <= 0) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const idx = Math.floor(Math.random() * n);
    const seg = 360 / n;
    const target = 360 - (idx * seg + seg / 2);
    const next = angle - (angle % 360) + (reduce ? 360 : 360 * 5) + target;
    setWinner(null);
    setSpinning(true);
    setAngle(next);
    setTimeout(() => {
      setSpinning(false);
      setWinner(items[idx]);
      if (!unlimited) {
        const u = used + 1;
        setUsed(u);
        try {
          localStorage.setItem(key, String(u));
        } catch {}
      }
    }, reduce ? 300 : 3600);
  }

  const R = 140;
  const seg = n ? 360 / n : 360;
  const pt = (deg: number, r: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [150 + r * Math.cos(a), 150 + r * Math.sin(a)];
  };

  return (
    <div className="px-5 text-center">
      <p className="mb-3 text-[13px] text-gris">Choisis le moment. Kalou fait tourner la roue avec des plats qui te vont.</p>
      <div className="flex flex-wrap justify-center gap-1.5">
        {categories.map((c) => (
          <button key={c.id} type="button" onClick={() => !spinning && setCat(c.id)} aria-pressed={c.id === cat} className={`pastille h-[34px] ${c.id === cat ? 'pastille-on' : 'bg-white'}`}>
            {c.name}
          </button>
        ))}
      </div>
      <div className="relative mx-auto mt-4 h-[330px] w-[300px]">
        <svg width="34" height="30" viewBox="0 0 34 30" className="absolute left-[133px] top-0 z-10" aria-hidden="true">
          <path d="M17 30L2 4Q0 0 5 0H29Q34 0 32 4Z" fill="#17132B" />
        </svg>
        <svg width="300" height="300" viewBox="0 0 300 300" className="absolute left-0 top-[22px]" style={{ transform: `rotate(${angle}deg)`, transition: spinning ? 'transform 3.5s cubic-bezier(.17,.67,.12,1)' : 'none' }} role="img" aria-label={`Roue de ${n} plats`}>
          <circle cx="150" cy="150" r="148" fill="#fff" />
          {items.map((d, i) => {
            const [x0, y0] = pt(i * seg, R);
            const [x1, y1] = pt((i + 1) * seg, R);
            const mid = i * seg + seg / 2;
            const [tx, ty] = pt(mid, 128);
            const label = d.name.split(',')[0];
            return (
              <g key={d.id}>
                <path d={`M150 150 L${x0} ${y0} A${R} ${R} 0 ${seg > 180 ? 1 : 0} 1 ${x1} ${y1} Z`} fill={COLS[i % COLS.length]} />
                <text x={tx} y={ty} fill="#fff" fontSize="12" fontWeight="700" textAnchor="start" dominantBaseline="middle" transform={`rotate(${mid + 90} ${tx} ${ty})`}>
                  {label.length > 12 ? label.slice(0, 11) + '…' : label}
                </text>
              </g>
            );
          })}
          <circle cx="150" cy="150" r="44" fill="#fff" />
        </svg>
        <img src="/kalou-joie.svg" alt="" width={78} height={78} className="absolute left-[111px] top-[133px]" />
      </div>
      <button type="button" onClick={spin} disabled={spinning || left <= 0} className="btn-soleil mt-2 w-full">
        {spinning ? 'Ça tourne…' : left <= 0 ? 'Plus de tours pour ce repas' : 'Tourner la roue'}
      </button>
      <p className="mt-3 text-[11.5px] text-gris">{unlimited ? 'Avec Plus : tours illimités.' : `${left} tour${left > 1 ? 's' : ''} restant${left > 1 ? 's' : ''} pour ce repas aujourd’hui. Avec Plus : illimité.`}</p>
      <div aria-live="polite">
        {winner && (
          <Link href={`/plat/${winner.slug}`} className="carte mt-4 flex items-center gap-3 p-3 text-left">
            <DishImage dish={winner} className="h-16 w-16 flex-none" />
            <span className="flex-1">
              <small className="text-xs text-gris">Kalou a choisi</small>
              <b className="block text-base">{winner.name}</b>
            </span>
            <span className="btn-violet h-10 px-4 text-sm">Voir</span>
          </Link>
        )}
      </div>
    </div>
  );
}
