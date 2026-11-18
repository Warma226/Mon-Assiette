// Mon Assiette v2 : restaurants autour de l'utilisateur via Google Places (API « New »).
// La clé Google reste sur le serveur (secret GOOGLE_PLACES_API_KEY). Compte connecté obligatoire.
// Gratuit : restaurants proches, 5 recherches/jour. Plus : filtres et recherche par plat, 60 recherches/jour.
import { createClient } from 'npm:@supabase/supabase-js@2';

let KEY = '';
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'apikey, authorization, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
// Clé lue dans les variables du serveur, sinon dans le coffre (Vault) du projet
async function secret(name: string) {
  const env = (Deno.env.get(name) ?? '').trim();
  if (env) return env;
  const { data } = await db.rpc('ma2_get_secret', { p_name: name });
  return String(data ?? '').trim();
}

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
const FIELDS = ['id', 'displayName', 'formattedAddress', 'location', 'rating', 'userRatingCount', 'priceLevel', 'currentOpeningHours.openNow', 'googleMapsUri', 'primaryTypeDisplayName'].map((f) => 'places.' + f).join(',');
const PRICE = ['PRICE_LEVEL_INEXPENSIVE', 'PRICE_LEVEL_MODERATE', 'PRICE_LEVEL_EXPENSIVE', 'PRICE_LEVEL_VERY_EXPENSIVE'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'method' });
  if (!KEY) KEY = await secret('GOOGLE_PLACES_API_KEY');
  const jwt = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: auth } = await db.auth.getUser(jwt);
  const user = auth?.user;
  if (!user) return json(401, { error: 'login' });
  if (!KEY) return json(503, { error: 'not_configured' });

  let b: { lat?: number; lng?: number; radius?: number; query?: string; openNow?: boolean; price?: number };
  try { b = await req.json(); } catch { return json(400, { error: 'bad' }); }
  const lat = Number(b.lat), lng = Number(b.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return json(400, { error: 'position' });

  const [{ data: prof }, { data: staff }] = await Promise.all([
    db.from('ma2_profiles').select('plus_until').eq('id', user.id).maybeSingle(),
    db.from('ma2_admin_roles').select('role').eq('user_id', user.id).maybeSingle(),
  ]);
  const plus = !!staff || (!!prof?.plus_until && new Date(prof.plus_until) > new Date());
  const query = plus ? String(b.query ?? '').trim().slice(0, 80) : '';
  const openNow = plus && !!b.openNow;
  const price = plus && Number(b.price) >= 1 && Number(b.price) <= 4 ? Number(b.price) : 0;
  const radius = Math.min(Math.max(Number(b.radius) || 2000, 300), plus ? 10000 : 3000);

  const n = await db.rpc('ma2_bump_usage', { p_user: user.id, p_kind: 'places', p_limit: plus ? 60 : 5 });
  if ((n.data ?? -1) < 0) return json(429, { error: 'quota', plus });

  const circle = { center: { latitude: lat, longitude: lng }, radius };
  const headers = { 'Content-Type': 'application/json', 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': FIELDS };
  let r: Response;
  if (query || openNow || price) {
    r = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        textQuery: query ? `${query} restaurant` : 'restaurant',
        includedType: 'restaurant',
        languageCode: 'fr',
        locationBias: { circle },
        maxResultCount: 20,
        ...(openNow ? { openNow: true } : {}),
        ...(price ? { priceLevels: PRICE.slice(0, price) } : {}),
      }),
    });
  } else {
    r = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers,
      body: JSON.stringify({ includedTypes: ['restaurant'], maxResultCount: plus ? 20 : 10, rankPreference: 'DISTANCE', languageCode: 'fr', locationRestriction: { circle } }),
    });
  }
  const g = await r.json().catch(() => null);
  if (!r.ok) return json(502, { error: 'google', status: r.status, reason: g?.error?.status ?? null });
  type P = { id: string; displayName?: { text: string }; formattedAddress?: string; location?: { latitude: number; longitude: number }; rating?: number; userRatingCount?: number; priceLevel?: string; currentOpeningHours?: { openNow?: boolean }; googleMapsUri?: string; primaryTypeDisplayName?: { text: string } };
  const dist = (p: P) => {
    if (!p.location) return null;
    const R = 6371000, toR = Math.PI / 180;
    const dLat = (p.location.latitude - lat) * toR, dLng = (p.location.longitude - lng) * toR;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat * toR) * Math.cos(p.location.latitude * toR) * Math.sin(dLng / 2) ** 2;
    return Math.round(2 * R * Math.asin(Math.sqrt(a)));
  };
  const places = ((g?.places ?? []) as P[]).map((p) => ({
    id: p.id,
    name: p.displayName?.text ?? 'Restaurant',
    address: p.formattedAddress ?? null,
    type: p.primaryTypeDisplayName?.text ?? null,
    rating: p.rating ?? null,
    ratings: p.userRatingCount ?? null,
    price: p.priceLevel ? PRICE.indexOf(p.priceLevel) + 1 || null : null,
    openNow: p.currentOpeningHours?.openNow ?? null,
    url: p.googleMapsUri ?? null,
    distance: dist(p),
  }));
  return json(200, { plus, places, left: (plus ? 60 : 5) - (n.data ?? 0) });
});
