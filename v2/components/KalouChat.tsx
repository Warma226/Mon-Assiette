'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Icon } from './Icon';

type Msg = { role: 'user' | 'assistant'; content: string };
const ERR: Record<string, string> = {
  not_configured: 'Je ne peux pas encore répondre : ma connexion n’est pas finie de régler. Réessaie bientôt !',
  quota: 'On a beaucoup discuté aujourd’hui ! Reviens demain pour de nouvelles questions.',
  busy: 'Beaucoup de monde me parle en ce moment. Réessaie dans une minute !',
  plus: 'La discussion avec moi fait partie de Mon Assiette Plus.',
  login: 'Reconnecte-toi pour continuer.',
};
const IDEAS = ['Que manger ce soir avec 1 500 F ?', 'J’ai du riz et des tomates, je fais quoi ?', 'Une idée de petit-déjeuner rapide ?', 'Un menu léger pour demain ?'];

// Liens internes du type [Riz gras](/plat/riz-gras) rendus cliquables ; le reste reste du texte brut
function Rich({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]{1,80})\]\((\/[a-z0-9\-/]{1,80})\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    parts.push(text.slice(last, m.index));
    parts.push(<Link key={m.index} href={m[2]} className="font-semibold text-violet-d underline">{m[1]}</Link>);
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return <span className="whitespace-pre-wrap">{parts.map((p) => (typeof p === 'string' ? p.replace(/\*\*/g, '') : p))}</span>;
}

export function KalouChat({ history, name }: { history: Msg[]; name: string | null }) {
  const [msgs, setMsgs] = useState<Msg[]>(history);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), [msgs, busy]);

  async function send(q: string) {
    const message = q.trim();
    if (!message || busy) return;
    setMsgs((m) => [...m, { role: 'user', content: message }]);
    setText('');
    setBusy(true);
    const { data, error } = await createClient().functions.invoke('ma2-kalou', { body: { message } });
    let code: string | undefined = data?.error;
    if (error && 'context' in error && error.context instanceof Response) code = (await error.context.json().catch(() => null))?.error;
    setMsgs((m) => [...m, { role: 'assistant', content: data?.reply ?? ERR[code ?? ''] ?? 'Oups, je n’arrive pas à répondre. Réessaie dans un instant.' }]);
    setBusy(false);
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2.5 pb-4">
        <div className="flex items-end gap-2">
          <img src="/kalou-joie.svg" alt="" width={36} height={36} className="flex-none" />
          <p className="max-w-[85%] rounded-[20px] rounded-bl-md bg-white px-4 py-3 text-sm shadow-[0_4px_14px_rgba(76,46,170,0.06)]">
            Salut{name ? ` ${name}` : ''} ! Moi c’est Kalou, l’ami de ton ventre. Dis-moi ce qu’il y a dans ta cuisine, je m’occupe du reste.
          </p>
        </div>
        {msgs.map((m, i) =>
          m.role === 'user' ? (
            <p key={i} className="ml-auto max-w-[85%] rounded-[20px] rounded-br-md bg-violet px-4 py-3 text-sm text-white">{m.content}</p>
          ) : (
            <div key={i} className="flex items-end gap-2">
              <img src="/kalou-clin.svg" alt="" width={36} height={36} className="flex-none" />
              <p className="max-w-[85%] rounded-[20px] rounded-bl-md bg-white px-4 py-3 text-sm shadow-[0_4px_14px_rgba(76,46,170,0.06)]"><Rich text={m.content} /></p>
            </div>
          ),
        )}
        {busy && <p className="ml-11 text-xs text-gris">Kalou soulève les couvercles…</p>}
        <div ref={end} />
      </div>
      {msgs.length === 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {IDEAS.map((q) => <button key={q} onClick={() => send(q)} className="pastille bg-white ring-1 ring-ligne">{q}</button>)}
        </div>
      )}
      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="sticky bottom-[96px] flex gap-2 lg:bottom-4">
        <label className="champ flex-1 shadow-[0_6px_20px_rgba(76,46,170,0.1)]"><span className="sr-only">Ta question</span>
          <input value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Pose ta question à Kalou…" />
        </label>
        <button disabled={busy || text.trim().length < 2} aria-label="Envoyer" className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-full bg-violet text-white disabled:opacity-50">
          <Icon name="send" size={20} color="#fff" />
        </button>
      </form>
      <p className="mt-2 text-center text-[10.5px] text-gris">Kalou peut se tromper. Ce n’est pas un avis médical.</p>
    </div>
  );
}
