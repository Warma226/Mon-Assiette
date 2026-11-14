// Paiement Mon Assiette Plus avec PayDunya (Orange Money, Moov, MTN, Wave, carte…).
// Les clés PayDunya restent sur le serveur. Les prix sont fixés ici, jamais par le téléphone.
// Un paiement n'active l'abonnement qu'après vérification directe auprès de PayDunya.
import { createClient } from 'npm:@supabase/supabase-js@2';

const MASTER = Deno.env.get('PAYDUNYA_MASTER_KEY') ?? '';
const PRIVATE = Deno.env.get('PAYDUNYA_PRIVATE_KEY') ?? '';
const TOKEN = Deno.env.get('PAYDUNYA_TOKEN') ?? '';
const MODE = (Deno.env.get('PAYDUNYA_MODE') ?? 'test') === 'live' ? 'live' : 'test';
const APP_URL = Deno.env.get('APP_URL') ?? 'https://mon-assiette-nine.vercel.app';
const SELF_URL = `${Deno.env.get('SUPABASE_URL')}/functions/v1/ma-pay`;
const API = MODE === 'live' ? 'https://app.paydunya.com/api/v1' : 'https://app.paydunya.com/sandbox-api/v1';
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

const PLANS: Record<string, { amount: number; label: string }> = {
  semaine: { amount: 650, label: 'Mon Assiette Plus · 1 semaine' },
  mois: { amount: 1000, label: 'Mon Assiette Plus · 1 mois' },
  trimestre: { amount: 2500, label: 'Mon Assiette Plus · 3 mois' },
  annee: { amount: 9000, label: 'Mon Assiette Plus · 1 an' }
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'apikey, authorization, content-type, x-device-id, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
const configured = () => !!(MASTER && PRIVATE && TOKEN);
const headers = () => ({ 'Content-Type': 'application/json', 'PAYDUNYA-MASTER-KEY': MASTER, 'PAYDUNYA-PRIVATE-KEY': PRIVATE, 'PAYDUNYA-TOKEN': TOKEN });

async function sha512(s: string) {
  const d = await crypto.subtle.digest('SHA-512', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Lit un formulaire « data[invoice][token]=… » en objet
function parseForm(body: string) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of new URLSearchParams(body)) {
    const path = k.replace(/\]/g, '').split('[');
    let o = out as Record<string, unknown>;
    path.forEach((p, i) => {
      if (i === path.length - 1) o[p] = v;
      else o = (o[p] = (o[p] as Record<string, unknown>) ?? {}) as Record<string, unknown>;
    });
  }
  return out;
}

// Vérifie le paiement directement chez PayDunya puis prolonge l'abonnement (une seule fois)
async function settle(token: string) {
  const { data: pay } = await db.from('ma_payments').select('*').eq('token', token).maybeSingle();
  if (!pay) return { ok: false, error: 'unknown_payment' };
  const r = await fetch(`${API}/checkout-invoice/confirm/${encodeURIComponent(token)}`, { headers: headers() });
  const c = await r.json().catch(() => null);
  if (!c || c.response_code !== '00') return { ok: false, error: 'confirm_failed', status: pay.status };
  const st = String(c.status || '').toLowerCase();
  const status = st === 'completed' ? 'completed' : st.startsWith('cancel') ? 'cancelled' : st === 'failed' ? 'failed' : 'pending';
  const paidAmount = Number(c.invoice?.total_amount ?? 0);
  const sameDevice = c.custom_data?.device_id === pay.device_id && c.custom_data?.payment_id === pay.id;
  if (status === 'completed' && (paidAmount < pay.amount || !sameDevice)) {
    await db.from('ma_payments').update({ status: 'failed', details: { reason: 'mismatch', paidAmount } }).eq('id', pay.id);
    return { ok: false, error: 'mismatch' };
  }
  if (status !== pay.status) {
    await db.from('ma_payments').update({ status, paid_at: status === 'completed' ? new Date().toISOString() : null, details: { receipt_url: c.receipt_url ?? null, fail_reason: c.fail_reason ?? null } }).eq('id', pay.id);
  }
  if (status !== 'completed') return { ok: true, status };
  const { data: applied } = await db.rpc('ma_apply_payment', { p_id: pay.id });
  return { ok: true, status, plan: applied?.plan, until: applied?.until, receipt: c.receipt_url ?? null };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'method' });
  const url = new URL(req.url);

  // 1. Notification de PayDunya (IPN)
  if (url.searchParams.get('ipn') === '1') {
    if (!configured()) return json(503, { error: 'not_configured' });
    const form = parseForm(await req.text());
    const data = (form.data ?? {}) as Record<string, any>;
    if (!data.hash || data.hash !== (await sha512(MASTER))) return json(401, { error: 'bad_hash' });
    const token = data.invoice?.token;
    if (!token) return json(400, { error: 'no_token' });
    return json(200, await settle(String(token)));
  }

  // 2. Demandes de l'app
  let body: { action?: string; plan?: string; token?: string };
  try { body = await req.json(); } catch { body = {}; }
  if (body.action === 'ping') return json(200, { configured: configured(), mode: MODE });
  if (!configured()) return json(503, { error: 'not_configured' });

  const device = (req.headers.get('x-device-id') ?? '').trim();
  if (!/^[0-9a-f-]{36}$/i.test(device)) return json(401, { error: 'device' });
  const { data: prof } = await db.from('ma_profiles').select('device_id, name').eq('device_id', device).maybeSingle();
  if (!prof) return json(403, { error: 'unknown_device' });

  if (body.action === 'create') {
    const plan = PLANS[body.plan ?? ''];
    if (!plan) return json(400, { error: 'bad_plan' });
    // Évite les doublons : au plus 5 paiements en attente par appareil et par heure
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await db.from('ma_payments').select('id', { count: 'exact', head: true }).eq('device_id', device).gte('created_at', since);
    if ((count ?? 0) >= 5) return json(429, { error: 'too_many' });

    const { data: pay, error } = await db.from('ma_payments').insert({ device_id: device, plan: body.plan, amount: plan.amount, mode: MODE }).select().single();
    if (error || !pay) return json(500, { error: 'db' });
    const r = await fetch(`${API}/checkout-invoice/create`, {
      method: 'POST', headers: headers(),
      body: JSON.stringify({
        invoice: { total_amount: plan.amount, description: plan.label, items: { item_0: { name: plan.label, quantity: 1, unit_price: String(plan.amount), total_price: String(plan.amount) } } },
        store: { name: 'Mon Assiette', tagline: 'Ton assistant nutrition', logo_url: `${APP_URL}/icons/icon-512.png`, website_url: APP_URL },
        custom_data: { device_id: device, payment_id: pay.id, plan: body.plan },
        actions: { cancel_url: `${APP_URL}/?pay=cancel`, return_url: `${APP_URL}/?pay=done`, callback_url: `${SELF_URL}?ipn=1` }
      })
    });
    const c = await r.json().catch(() => null);
    if (!c || c.response_code !== '00' || !c.token) {
      await db.from('ma_payments').update({ status: 'failed', details: { create: c } }).eq('id', pay.id);
      return json(502, { error: 'paydunya', detail: c?.response_text ?? null });
    }
    await db.from('ma_payments').update({ token: c.token }).eq('id', pay.id);
    return json(200, { ok: true, url: c.response_text, token: c.token, mode: MODE });
  }

  if (body.action === 'status') {
    const token = String(body.token ?? '');
    const { data: pay } = await db.from('ma_payments').select('device_id').eq('token', token).maybeSingle();
    if (!pay || pay.device_id !== device) return json(404, { error: 'not_found' });
    return json(200, await settle(token));
  }

  return json(400, { error: 'action' });
});
