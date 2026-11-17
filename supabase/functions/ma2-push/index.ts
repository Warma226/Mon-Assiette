// Mon Assiette v2 : envoie les rappels (notifications) à l'heure locale de chaque abonné Plus.
// Appelée toutes les 5 minutes par pg_cron, avec l'en-tête x-cron-secret.
import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
const PUB = 'BMMtPgr5uHuV687K1pTLtLyJaodaYl7fLlveaazUr5pyX1Lzl3fp2vQ-XdvWvNjrxIFoEYtrqte-rcsHWm7Nxz0';
// Secrets rangés dans le coffre (Vault) de Supabase, lus par une fonction réservée au serveur
let CFG: { cron: string; vapid: string } | null = null;
async function config() {
  if (CFG) return CFG;
  const { data } = await db.rpc('ma2_push_config');
  CFG = { cron: data?.cron ?? '', vapid: data?.vapid ?? '' };
  if (CFG.vapid) webpush.setVapidDetails('https://mon-assiette-nine.vercel.app', PUB, CFG.vapid);
  return CFG;
}

function local(tz: string, at = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short', hour12: false }).formatToParts(at).map((x) => [x.type, x.value]));
  const dow = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(p.weekday) + 1;
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: (Number(p.hour) % 24) * 60 + Number(p.minute), dow };
}

Deno.serve(async (req) => {
  const cfg = await config();
  if (!cfg.cron || req.headers.get('x-cron-secret') !== cfg.cron) return new Response('forbidden', { status: 403 });
  if (!cfg.vapid) return new Response(JSON.stringify({ error: 'no_vapid' }), { status: 503 });
  const { data: rows } = await db
    .from('ma2_reminders')
    .select('id, user_id, kind, label, at_time, days, last_sent_on')
    .eq('enabled', true)
    .limit(5000);
  if (!rows?.length) return Response.json({ sent: 0 });
  const users = [...new Set(rows.map((r) => r.user_id))];
  const [{ data: profiles }, { data: staff }, { data: subs }] = await Promise.all([
    db.from('ma2_profiles').select('id, timezone, plus_until').in('id', users),
    db.from('ma2_admin_roles').select('user_id').in('user_id', users),
    db.from('ma2_push_subscriptions').select('endpoint, user_id, p256dh, auth').in('user_id', users),
  ]);
  const prof = new Map((profiles ?? []).map((p) => [p.id, p]));
  const team = new Set((staff ?? []).map((s) => s.user_id));
  const now = new Date();
  let sent = 0;
  for (const r of rows) {
    const p = prof.get(r.user_id);
    const plus = team.has(r.user_id) || (p?.plus_until && new Date(p.plus_until) > now);
    if (!plus) continue;
    const t = local(p?.timezone || 'Africa/Ouagadougou', now);
    const [h, m] = String(r.at_time).split(':').map(Number);
    const due = h * 60 + m;
    if (!r.days.includes(t.dow) || r.last_sent_on === t.date || t.minutes < due || t.minutes >= due + 10) continue;
    await db.from('ma2_reminders').update({ last_sent_on: t.date }).eq('id', r.id);
    const url = r.kind === 'marche' ? '/courses' : r.kind === 'repas' ? '/assistant' : '/rappels';
    const payload = JSON.stringify({ title: 'Kalou te rappelle', body: r.label, tag: `ma2-${r.id}`, url });
    for (const s of (subs ?? []).filter((x) => x.user_id === r.user_id)) {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 3600 });
        sent++;
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) await db.from('ma2_push_subscriptions').delete().eq('endpoint', s.endpoint);
      }
    }
  }
  return Response.json({ sent });
});
