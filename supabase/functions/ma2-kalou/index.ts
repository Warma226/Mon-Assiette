// Mon Assiette v2 : discussion avec Kalou (réservée à Plus). Clé IA sur le serveur (secret ANTHROPIC_API_KEY).
// Kalou s'appuie sur le catalogue publié et le profil de l'utilisateur ; il n'invente ni prix ni valeur nutritionnelle.
import { createClient } from 'npm:@supabase/supabase-js@2';

const KEY = (Deno.env.get('ANTHROPIC_API_KEY') ?? '').trim();
const MODEL = Deno.env.get('MA2_KALOU_MODEL') ?? 'claude-haiku-5-5';
const LIMIT = 30;
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'apikey, authorization, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'method' });
  const jwt = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: auth } = await db.auth.getUser(jwt);
  const user = auth?.user;
  if (!user) return json(401, { error: 'login' });

  let body: { message?: string };
  try { body = await req.json(); } catch { body = {}; }
  const message = String(body.message ?? '').trim().slice(0, 1000);
  if (message.length < 2) return json(400, { error: 'empty' });

  const [{ data: prof }, { data: staff }] = await Promise.all([
    db.from('ma2_profiles').select('display_name, plus_until, budget_amount, budget_period, household_size, timezone, city, country_id').eq('id', user.id).maybeSingle(),
    db.from('ma2_admin_roles').select('role').eq('user_id', user.id).maybeSingle(),
  ]);
  const plus = !!staff || (!!prof?.plus_until && new Date(prof.plus_until) > new Date());
  if (!plus) return json(402, { error: 'plus' });
  if (!KEY) return json(503, { error: 'not_configured' });

  const used = await db.rpc('ma2_bump_usage', { p_user: user.id, p_kind: 'kalou', p_limit: LIMIT });
  if ((used.data ?? -1) < 0) return json(429, { error: 'quota' });

  const [{ data: dishes }, { data: allergies }, { data: prefs }, { data: members }, { data: avail }, { data: history }] = await Promise.all([
    db.from('ma2_dishes').select('slug, name, category_id, tags, allergens, prep_minutes, di:ma2_dish_ingredients(ingredient:ma2_ingredients(name))').eq('status', 'publie'),
    db.from('ma2_user_allergies').select('allergen_id').eq('user_id', user.id),
    db.from('ma2_user_preferences').select('preference_id').eq('user_id', user.id),
    db.from('ma2_household_members').select('name, kind, allergies').eq('user_id', user.id),
    db.from('ma2_available_ingredients').select('ingredient:ma2_ingredients(name)').eq('user_id', user.id),
    db.from('ma2_kalou_messages').select('role, content').eq('user_id', user.id).order('created_at', { ascending: false }).limit(12),
  ]);
  type D = { slug: string; name: string; category_id: string; tags: string[]; allergens: string[]; prep_minutes: number | null; di: { ingredient: { name: string } | null }[] };
  const catalogue = ((dishes ?? []) as unknown as D[])
    .map((d) => `- ${d.name} [/plat/${d.slug}] moment=${d.category_id}; ingrédients: ${d.di.map((x) => x.ingredient?.name).filter(Boolean).join(', ')}${d.allergens.length ? `; allergènes: ${d.allergens.join(', ')}` : ''}${d.prep_minutes ? `; ${d.prep_minutes} min` : ''}`)
    .join('\n');
  const tz = prof?.timezone || 'Africa/Ouagadougou';
  const now = new Intl.DateTimeFormat('fr-FR', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date());
  const household = (members ?? []).map((m) => `${m.name} (${m.kind}${m.allergies.length ? `, allergies: ${m.allergies.join(', ')}` : ''})`).join('; ');
  const athome = ((avail ?? []) as unknown as { ingredient: { name: string } | null }[]).map((a) => a.ingredient?.name).filter(Boolean).join(', ');

  const system = `Tu es Kalou, la mascotte et l'assistant de l'application Mon Assiette (Burkina Faso, Afrique de l'Ouest). Tu aides à choisir quoi manger au quotidien, avec des plats d'ici, un budget serré et une famille.
Règles :
- Réponds en français simple et chaleureux, en tutoyant, en 2 à 6 phrases ou une courte liste. Pas de longs paragraphes.
- Propose en priorité des plats du catalogue ci-dessous et donne leur lien sous la forme [Nom du plat](/plat/slug). Tu peux citer d'autres plats connus de la région, mais dis alors qu'ils ne sont pas encore dans l'appli.
- N'invente jamais de prix, de quantités précises, de calories ni de valeurs nutritionnelles. Si on te demande un prix, dis que les prix du marché varient et que l'appli les affichera quand ils seront vérifiés.
- Exclus toujours les plats qui contiennent un allergène de l'utilisateur ou d'un membre de sa famille.
- Tu n'es pas médecin : pour une maladie, une grossesse, un bébé, un régime médical ou une allergie grave, donne seulement des conseils généraux et invite à consulter un professionnel de santé.
- Tu peux orienter vers les écrans de l'appli : /assistant (préparer la journée ou la semaine), /courses, /budget, /menus, /restaurants, /planning.
- Reste sur l'alimentation, la cuisine, les courses et l'organisation des repas ; ramène poliment la conversation sur ces sujets sinon.

Contexte de l'utilisateur :
- Prénom : ${prof?.display_name ?? 'inconnu'} ; maintenant : ${now}
- Budget : ${prof?.budget_amount ? `${prof.budget_amount} F CFA par ${prof.budget_period ?? 'jour'}` : 'non indiqué'} ; foyer : ${prof?.household_size ?? 1} personne(s)
- Allergies : ${(allergies ?? []).map((a) => a.allergen_id).join(', ') || 'aucune'} ; préférences : ${(prefs ?? []).map((p) => p.preference_id).join(', ') || 'aucune'}
- Famille : ${household || 'non renseignée'}
- Ingrédients à la maison : ${athome || 'non renseignés'}

Catalogue des plats publiés :
${catalogue}`;

  const past = (history ?? []).reverse().map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
  while (past.length && past[0].role !== 'user') past.shift();
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: 600, system, messages: [...past, { role: 'user', content: message }] }),
  });
  const g = await r.json().catch(() => null);
  if (r.status === 401 || r.status === 403) return json(503, { error: 'not_configured' });
  if (!r.ok) return json(502, { error: 'ai', status: r.status });
  const reply = String((g?.content ?? []).filter((c: { type: string }) => c.type === 'text').map((c: { text: string }) => c.text).join('\n')).trim().slice(0, 4000) || 'Désolé, je n’ai pas compris. Peux-tu reformuler ?';
  const t = Date.now();
  await db.from('ma2_kalou_messages').insert([
    { user_id: user.id, role: 'user', content: message, created_at: new Date(t).toISOString() },
    { user_id: user.id, role: 'assistant', content: reply, created_at: new Date(t + 1).toISOString() },
  ]);
  return json(200, { reply, left: LIMIT - (used.data ?? 0) });
});
