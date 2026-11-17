import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ALLOWED = ['/', '/favoris', '/planning', '/profil', '/ingredients', '/decouvrir', '/abonnement'];

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const nextParam = url.searchParams.get('next') ?? '/';
  const next = ALLOWED.includes(nextParam) ? nextParam : '/';
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await supabase.rpc('ma2_ensure_profile');
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }
  return NextResponse.redirect(new URL('/connexion?erreur=lien', url.origin));
}
