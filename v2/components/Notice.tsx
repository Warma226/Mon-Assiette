export function Notice({ ok, err }: { ok?: string; err?: string }) {
  if (!ok && !err) return null;
  return (
    <p className={`mb-3 rounded-2xl px-4 py-3 text-[13px] font-medium ${err ? 'bg-corail-l text-corail' : 'bg-emeraude-l text-emeraude'}`} role="status">
      {err ?? ok}
    </p>
  );
}
