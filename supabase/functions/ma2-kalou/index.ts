// Mon Assiette v2 : discussion avec Kalou (réservée à Plus).
// IA gratuite Groq (secret GROQ_API_KEY), modèles ouverts ; si un modèle est saturé, on essaie le suivant.
// Kalou s'appuie sur le catalogue publié et le profil de l'utilisateur ; il n'invente ni prix ni valeur nutritionnelle.
import { createClient } from 'npm:@supabase/supabase-js@2';

let KEY = '';
const MODELS = (Deno.env.get('MA2_KALOU_MODELS') ?? 'openai/gpt-oss-120b,openai/gpt-oss-20b,qwen/qwen3.8-27b').split(',').map((m) => m.trim()).filter(Boolean);
const LIMIT = 20;
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'method' });
  if (!KEY) KEY = await secret('GROQ_API_KEY');
  // Test de configuration : liste des modèles Groq disponibles (ne consomme pas de quota)
  const peek = await req.clone().json().catch(() => ({}));
  if (peek?.action === 'ping') {
    if (!KEY) return json(200, { configured: false });
    const m = await fetch('https://api.groq.com/openai/v1/models', { headers: { Authorization: `Bearer ${KEY}` } }).catch(() => null);
    const list = m && m.ok ? ((await m.json()).data ?? []).map((x: { id: string }) => x.id) : [];
    return json(200, { configured: true, status: m?.status ?? null, available: MODELS.filter((x) => list.includes(x)) });
  }
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
    db.from('ma2_dishes').select('slug, name, category_id, moments, tags, allergens, prep_minutes, is_fried, is_sweet, is_light, di:ma2_dish_ingredients(ingredient:ma2_ingredients(name, food_group))').eq('status', 'publie'),
    db.from('ma2_user_allergies').select('allergen_id').eq('user_id', user.id),
    db.from('ma2_user_preferences').select('preference_id').eq('user_id', user.id),
    db.from('ma2_household_members').select('name, kind, allergies').eq('user_id', user.id),
    db.from('ma2_available_ingredients').select('ingredient:ma2_ingredients(name)').eq('user_id', user.id),
    db.from('ma2_kalou_messages').select('role, content').eq('user_id', user.id).order('created_at', { ascending: false }).limit(12),
  ]);
  type D = { slug: string; name: string; category_id: string; moments: string[]; tags: string[]; allergens: string[]; prep_minutes: number | null; is_fried: boolean; is_sweet: boolean; is_light: boolean; di: { ingredient: { name: string; food_group: string | null } | null }[] };
  const catalogue = ((dishes ?? []) as unknown as D[])
    .map((d) => `- ${d.name} (/plat/${d.slug}) moments: ${d.moments.join('/')}; ${d.di.map((x) => x.ingredient?.name).filter(Boolean).join(', ')}; groupes: ${[...new Set(d.di.map((x) => x.ingredient?.food_group).filter((g) => g && g !== 'condiments'))].join(', ')}${d.is_fried ? '; frit' : ''}${d.is_sweet ? '; sucré' : ''}${d.is_light ? '; léger' : ''}${d.allergens.length ? `; allergènes: ${d.allergens.join(', ')}` : ''}`)
    .join('\n');
  const tz = prof?.timezone || 'Africa/Ouagadougou';
  const now = new Intl.DateTimeFormat('fr-FR', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date());
  const household = (members ?? []).map((m) => `${m.name} (${m.kind}${m.allergies.length ? `, allergies: ${m.allergies.join(', ')}` : ''})`).join('; ');
  const athome = ((avail ?? []) as unknown as { ingredient: { name: string } | null }[]).map((a) => a.ingredient?.name).filter(Boolean).join(', ');

  const system = `Tu es Kalou, la mascotte et l'assistant de l'application Mon Assiette (Burkina Faso, Afrique de l'Ouest). Tu aides à manger équilibré au quotidien, pour le bien-être de l'utilisateur et de sa famille, en tenant compte de son budget. L'origine d'un plat (d'ici ou d'ailleurs) n'est jamais un critère : seuls comptent l'équilibre, la santé et le plaisir.
Règles :
- Ton style : drôle et taquin, comme un ami blagueur du quartier. Une petite blague, une image amusante ou un clin d'œil par réponse, jamais moqueur envers la personne, son corps ou son poids. Français simple, tutoiement.
- Sois bref : 1 à 3 phrases courtes, ou une liste de 3 points maximum. Va droit au but, pas de politesses inutiles ni de récapitulatif. Si la question demande plus de détails, donne l'essentiel et propose d'en dire plus.
- Reste sérieux (sans blague) quand on parle de maladie, de grossesse, de bébé ou d'allergie grave.
- Propose en priorité des plats du catalogue ci-dessous et donne leur lien sous la forme [Nom du plat](/plat/slug). Tu peux citer d'autres plats, mais dis alors qu'ils ne sont pas encore dans l'appli.
- N'invente jamais de prix, de quantités précises, de calories ni de valeurs nutritionnelles. Si on te demande un prix, dis que les prix du marché varient et que l'appli les affichera quand ils seront vérifiés.
- Exclus toujours les plats qui contiennent un allergène de l'utilisateur ou d'un membre de sa famille.
- Tes conseils suivent les repères de l'OMS et des guides alimentaires d'Afrique de l'Ouest (FAO) : varier chaque jour céréales ou tubercules, protéines (légumineuses, poisson, œuf, viande, lait), légumes et fruits ; au moins 2 repas avec des légumes et un fruit par jour ; légumineuses plusieurs fois par semaine, plutôt dans un repas principal ; repas principaux complets (base + protéine + légumes) ; petit-déjeuner et collations légers, sans friture ; au plus un plat sucré et un plat frit par jour ; peu de sel.
- Ne propose un plat qu'aux moments indiqués pour lui dans le catalogue.
- Fin de soirée (à partir de 21 h, regarde l'heure ci-dessous) : ne propose rien de lourd, gras, frit ni de légumineuses. Seulement les plats marqués « léger » ou un fruit, en petite quantité, et dis en une phrase qu'un repas lourd juste avant de dormir se digère mal.
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

  const past = (history ?? []).reverse().slice(-8).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content.slice(0, 1500) }));
  while (past.length && past[0].role !== 'user') past.shift();
  const messages = [{ role: 'system', content: system }, ...past, { role: 'user', content: message }];

  let reply = '';
  let busy = false;
  for (const model of MODELS) {
    const ask = (extra: Record<string, unknown>) =>
      fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, temperature: 0.6, max_completion_tokens: 500, ...extra }),
      });
    let r = await ask(model.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low', include_reasoning: false } : {});
    if (r.status === 400) r = await ask({});
    if (r.status === 401 || r.status === 403) return json(503, { error: 'not_configured' });
    if (r.status === 429 || r.status === 404 || r.status >= 500) { busy = busy || r.status === 429; continue; }
    const g = await r.json().catch(() => null);
    if (!r.ok) continue;
    reply = String(g?.choices?.[0]?.message?.content ?? '').replace(/<think>[\s\S]*?<\/think>/g, '').trim().slice(0, 4000);
    if (reply) break;
  }
  if (!reply) return json(busy ? 429 : 502, { error: busy ? 'busy' : 'ai' });
  const t = Date.now();
  await db.from('ma2_kalou_messages').insert([
    { user_id: user.id, role: 'user', content: message, created_at: new Date(t).toISOString() },
    { user_id: user.id, role: 'assistant', content: reply, created_at: new Date(t + 1).toISOString() },
  ]);
  return json(200, { reply, left: LIMIT - (used.data ?? 0) });
});
