import Link from 'next/link';

export const metadata = { title: 'Hors ligne' };

export default function HorsLigne() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <img src="/kalou-clin.svg" alt="" width={120} height={120} />
      <h1 className="mt-2 text-xl font-bold">Pas de connexion</h1>
      <p className="mt-1.5 text-sm text-gris">Mon Assiette a besoin d’internet pour afficher des plats et des prix à jour. Réessaie dès que le réseau revient.</p>
      <Link href="/" className="btn-violet mt-5">Réessayer</Link>
    </main>
  );
}
