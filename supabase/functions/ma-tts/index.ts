// Voix de Kalou : synthèse vocale neuronale (Microsoft Azure Speech, offre gratuite F0).
// La clé Azure reste sur le serveur. Chaque audio fabriqué est gardé et réutilisé pour tout le monde,
// et un plafond mensuel empêche de dépasser le quota gratuit.
import { createClient } from 'npm:@supabase/supabase-js@2';

const KEY = Deno.env.get('AZURE_SPEECH_KEY') ?? '';
const REGION = Deno.env.get('AZURE_SPEECH_REGION') ?? '';
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

const VOICES: Record<string, string> = {
  denise: 'fr-FR-DeniseNeural',
  henri: 'fr-FR-HenriNeural',
  vivienne: 'fr-FR-VivienneMultilingualNeural',
  remy: 'fr-FR-RemyMultilingualNeural',
  eloise: 'fr-FR-EloiseNeural'
};
const MONTH_CAP = 450_000;   // l'offre gratuite donne 500 000 caractères par mois
const DAY_CAP_N = 60;        // nouvelles synthèses par appareil et par jour
const MAX_CHARS = 1500;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'apikey, authorization, content-type, x-device-id, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
const mp3 = (buf: ArrayBuffer, cached: boolean) => new Response(buf, { headers: { ...CORS, 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Cache': cached ? 'HIT' : 'MISS' } });
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

async function sha(s: string) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'method' });
  if (!KEY || !REGION) return json(503, { error: 'not_configured' });

  const device = (req.headers.get('x-device-id') ?? '').trim();
  if (!/^[0-9a-f-]{36}$/i.test(device)) return json(401, { error: 'device' });

  let body: { text?: string; voice?: string };
  try { body = await req.json(); } catch { return json(400, { error: 'json' }); }
  const text = String(body.text ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_CHARS);
  const voiceId = VOICES[body.voice ?? ''] ? body.voice! : 'denise';
  if (!text) return json(400, { error: 'empty' });

  const key = `${voiceId}/${await sha(voiceId + '|' + text)}.mp3`;

  // 1. Déjà fabriqué ? On le renvoie sans rien consommer
  const hit = await db.storage.from('ma-tts').download(key);
  if (hit.data) return mp3(await hit.data.arrayBuffer(), true);

  // 2. Seuls les appareils connus de l'app peuvent fabriquer une nouvelle voix
  const { data: prof } = await db.from('ma_profiles').select('device_id').eq('device_id', device).maybeSingle();
  if (!prof) return json(403, { error: 'unknown_device' });

  const today = new Date().toISOString().slice(0, 10), month = today.slice(0, 7);
  const { data: use } = await db.from('ma_tts_usage').select('n, chars').eq('device_id', device).eq('day', today).maybeSingle();
  if (use && use.n >= DAY_CAP_N) return json(429, { error: 'day_cap' });
  const { data: mon } = await db.from('ma_tts_month').select('chars').eq('month', month).maybeSingle();
  if (mon && mon.chars + text.length > MONTH_CAP) return json(429, { error: 'month_cap' });

  // 3. Synthèse : voix chaleureuse, rythme posé
  const style = voiceId === 'denise' ? `<mstts:express-as style="cheerful" styledegree="0.6">` : '';
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="fr-FR">
<voice name="${VOICES[voiceId]}">${style}<prosody rate="-4%">${esc(text)}</prosody>${style ? '</mstts:express-as>' : ''}</voice></speak>`;
  const r = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: { 'Ocp-Apim-Subscription-Key': KEY, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3', 'User-Agent': 'mon-assiette' },
    body: ssml
  });
  if (!r.ok) return json(502, { error: 'azure', status: r.status });
  const audio = await r.arrayBuffer();

  // 4. On garde l'audio et on compte
  await db.storage.from('ma-tts').upload(key, new Blob([audio], { type: 'audio/mpeg' }), { upsert: true, contentType: 'audio/mpeg' });
  await db.from('ma_tts_usage').upsert({ device_id: device, day: today, n: (use?.n ?? 0) + 1, chars: (use?.chars ?? 0) + text.length });
  await db.from('ma_tts_month').upsert({ month, chars: (mon?.chars ?? 0) + text.length });
  return mp3(audio, false);
});
