import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/data';
import { LoginForm } from '@/components/LoginForm';

export const metadata: Metadata = { title: 'Connexion' };
export const dynamic = 'force-dynamic';

const NEXT: Record<string, string> = { favoris: '/favoris', planning: '/planning', profil: '/profil' };

export default async function Connexion({ searchParams }: { searchParams: Promise<{ suite?: string; erreur?: string }> }) {
  const { suite, erreur } = await searchParams;
  const { user } = await getSession();
  const next = NEXT[suite ?? ''] ?? '/';
  if (user) redirect(next);
  return (
    <main className="min-h-dvh pb-32 lg:pl-[280px]">
      <div className="relative flex h-[300px] flex-col items-center justify-center overflow-hidden rounded-b-[40px] bg-gradient-to-br from-violet to-violet-l text-white lg:mx-6 lg:mt-6 lg:rounded-[40px]">
        <span className="absolute -left-14 -top-14 h-48 w-48 rounded-full bg-white/10" />
        <img src="/kalou-joie.svg" alt="Kalou, la mascotte" width={140} height={140} />
        <b className="mt-1 text-[26px] font-extrabold">Mon Assiette</b>
        <small className="text-[13px] opacity-90">Mieux choisir. Mieux manger.</small>
      </div>
      <div className="mx-auto max-w-md px-5 pt-6">
        <h1 className="text-[22px] font-bold">Connecte-toi</h1>
        <p className="mb-4 mt-1 text-[13px] text-gris">Pour garder tes favoris, tes ingrédients et ton planning sur tous tes appareils.</p>
        {erreur && <p role="alert" className="mb-3 rounded-2xl bg-corail-l px-4 py-3 text-[13px] text-[#8A2512]">Le lien de connexion n’est plus valable. Demande-en un nouveau.</p>}
        <LoginForm next={next} />
        <Link href="/" className="mt-5 block text-center text-sm font-semibold text-violet-d">
          Découvrir sans compte
        </Link>
        <p className="mt-4 text-center text-[11px] text-gris">
          En continuant, tu acceptes les <Link href="/conditions" className="underline">conditions d’utilisation</Link> et la <Link href="/confidentialite" className="underline">politique de confidentialité</Link>.
        </p>
      </div>
    </main>
  );
}
