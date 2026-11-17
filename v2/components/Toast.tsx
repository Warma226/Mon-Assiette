'use client';
import { useEffect, useState } from 'react';

type Msg = { id: number; text: string; kind: 'ok' | 'erreur' };
let push: ((m: Msg) => void) | null = null;

// Notifications de confirmation et messages d'erreur (cahier §8)
export function toast(text: string, kind: 'ok' | 'erreur' = 'ok') {
  push?.({ id: Date.now() + Math.random(), text, kind });
}

export function Toaster() {
  const [list, setList] = useState<Msg[]>([]);
  useEffect(() => {
    push = (m) => {
      setList((l) => [...l, m]);
      setTimeout(() => setList((l) => l.filter((x) => x.id !== m.id)), 3200);
    };
    return () => {
      push = null;
    };
  }, []);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-28 z-50 flex flex-col items-center gap-2 px-5 lg:bottom-8">
      {list.map((m) => (
        <div key={m.id} className={`pointer-events-auto w-full max-w-sm rounded-2xl px-4 py-3.5 text-[13.5px] shadow-lg ${m.kind === 'erreur' ? 'bg-corail-l text-[#8A2512]' : 'bg-encre text-white'}`}>
          {m.text}
        </div>
      ))}
    </div>
  );
}
