import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type Role = 'admin' | 'editeur';

// Vérifie que la personne connectée fait partie de l'équipe. La base revérifie tout (RLS + fonctions).
export async function requireStaff(need: Role[] = ['admin', 'editeur']) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/connexion?suite=admin');
  const { data } = await supabase.from('ma2_admin_roles').select('role').eq('user_id', user.id).maybeSingle();
  const role = (data?.role ?? null) as Role | null;
  if (!role || !need.includes(role)) redirect(role ? '/admin' : '/');
  return { supabase, user, role };
}

export const STATUS: Record<string, string> = { publie: 'Publié', a_verifier: 'À vérifier', brouillon: 'Brouillon', archive: 'Archivé' };

export function back(path: string, kind: 'ok' | 'err', msg: string): never {
  redirect(`${path}?${kind}=${encodeURIComponent(msg)}`);
}
