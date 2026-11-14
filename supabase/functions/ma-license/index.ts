// Activation de Mon Assiette Plus avec une clé de licence achetée sur Chariow.
// La clé API Chariow reste sur le serveur. Une clé ne sert qu'à un seul téléphone, une seule fois.
import { createClient } from 'npm:@supabase/supabase-js@2';

const KEY = Deno.env.get('CHARIOW_API_KEY') ?? '';
const API = 'https://api.chariow.com/v1';
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
const PRICES: Record<string, number> = { semaine: 650, mois: 1000, trimestre: 2500, annee: 9000 };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'apikey, authorization, content-type, x-device-id, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

// Reconnaît la formule à partir du nom du produit Chariow
function planOf(name: string) {
  const n = name.toLowerCase();
  if (/semaine/.test(n)) return 'semaine';
  if (/3\s*mois|trimestre/.test(n)) return 'trimestre';
  if (/\b1\s*an\b|année|annee|annuel/.test(n)) return 'annee';
  if (/mois/.test(n)) return 'mois';
  return null;
}

const chariow = (path: string, init: RequestInit = {}) =>
  fetch(`${API}${path}`, { ...init, headers: { Authorization: `Bearer ${KEY}`, Accept: 'application/json', 'Content-Type': 'application/json', ...(init.headers ?? {}) } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'method' });
  let body: { action?: string; key?: string };
  try { body = await req.json(); } catch { body = {}; }
  if (body.action === 'ping') return json(200, { configured: !!KEY });
  if (!KEY) return json(503, { error: 'not_configured' });

  const device = (req.headers.get('x-device-id') ?? '').trim();
  if (!/^[0-9a-f-]{36}$/i.test(device)) return json(401, { error: 'device' });
  const { data: prof } = await db.from('ma_profiles').select('device_id').eq('device_id', device).maybeSingle();
  if (!prof) return json(403, { error: 'unknown_device' });

  const key = String(body.key ?? '').trim().replace(/\s+/g, '');
  if (key.length < 6 || key.length > 120) return json(400, { error: 'bad_key' });
  const token = 'chariow:' + key;

  // Anti-abus : 10 essais de clé par téléphone et par heure
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await db.from('ma_payments').select('id', { count: 'exact', head: true }).eq('device_id', device).eq('mode', 'chariow-try').gte('created_at', since);
  if ((count ?? 0) >= 10) return json(429, { error: 'too_many' });

  // Déjà utilisée ?
  const { data: used } = await db.from('ma_payments').select('id, device_id, plan, applied').eq('token', token).maybeSingle();
  if (used && used.device_id !== device) return json(409, { error: 'used_elsewhere' });
  if (used && used.applied) {
    const { data: p } = await db.from('ma_profiles').select('plus_plan, plus_until').eq('device_id', device).maybeSingle();
    return json(200, { ok: true, already: true, plan: p?.plus_plan ?? used.plan, until: p?.plus_until ?? null });
  }

  // Vérification chez Chariow
  const r = await chariow(`/licenses/${encodeURIComponent(key)}`);
  if (r.status === 404) {
    await db.from('ma_payments').insert({ device_id: device, plan: 'semaine', amount: 0, mode: 'chariow-try', status: 'failed', details: { reason: 'unknown_key' } });
    return json(404, { error: 'unknown_key' });
  }
  const g = await r.json().catch(() => null);
  const lic = g?.data;
  if (!r.ok || !lic) return json(502, { error: 'chariow', status: r.status });
  if (lic.status === 'revoked' || lic.revoked_at) return json(410, { error: 'revoked' });
  if (lic.is_expired || lic.status === 'expired') return json(410, { error: 'expired' });
  const plan = planOf(String(lic.product?.name ?? ''));
  if (!plan) return json(422, { error: 'unknown_product', product: lic.product?.name ?? null });

  // Activation sur ce téléphone si la licence l'exige
  if (lic.status === 'pending_activation' || (!lic.is_active && lic.can_activate)) {
    const a = await chariow(`/licenses/${encodeURIComponent(key)}/activate`, { method: 'POST', body: JSON.stringify({ device_identifier: device }) });
    if (!a.ok) {
      const e = await a.json().catch(() => null);
      return json(409, { error: 'activation_failed', detail: e?.message ?? null });
    }
  } else if (!lic.is_active) {
    return json(409, { error: 'not_active' });
  }

  // Enregistre et applique (une seule fois grâce au jeton unique)
  let payId = used?.id;
  if (!payId) {
    const { data: pay, error } = await db.from('ma_payments').insert({
      device_id: device, plan, amount: PRICES[plan], token, mode: 'chariow', status: 'completed', paid_at: new Date().toISOString(),
      details: { license_id: lic.id, sale_id: lic.sale_id, customer_id: lic.customer_id, product: lic.product?.name, expires_at: lic.expires_at }
    }).select('id').single();
    if (error || !pay) return json(409, { error: 'used_elsewhere' });
    payId = pay.id;
  }
  const { data: applied } = await db.rpc('ma_apply_payment', { p_id: payId });
  if (!applied?.ok) return json(500, { error: 'apply_failed' });
  return json(200, { ok: true, plan: applied.plan, until: applied.until });
});
