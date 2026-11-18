import Link from 'next/link';
import type { Metadata } from 'next';
import { getSession } from '@/lib/data';
import { Empty, Page, TopBar } from '@/components/ui';
import { NewPassword } from '@/components/NewPassword';

export const metadata: Metadata = { title: 'Mon mot de passe' };
export const dynamic = 'force-dynamic';

export default async function MotDePasse() {
  const { user } = await getSession();
  return (
    <Page>
      <TopBar title="Mon mot de passe" back="/profil" />
      <div className="mx-auto max-w-md px-5">
        {user ? (
          <>
            <p className="mb-4 text-[13px] text-gris">Choisis un nouveau mot de passe pour <b>{user.email}</b>.</p>
            <NewPassword />
          </>
        ) : (
          <Empty title="Lien expiré" text="Ce lien n’est plus valable. Redemande un lien depuis « Mot de passe oublié »." action={<Link href="/connexion" className="btn-violet h-11 text-sm">Aller à la connexion</Link>} />
        )}
      </div>
    </Page>
  );
}
