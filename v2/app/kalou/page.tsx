import Link from 'next/link';
import type { Metadata } from 'next';
import { plusSession } from '@/lib/plus';
import { Empty, Page, TopBar } from '@/components/ui';
import { PlusGate } from '@/components/PlusGate';
import { KalouChat } from '@/components/KalouChat';

export const metadata: Metadata = { title: 'Demander à Kalou' };
export const dynamic = 'force-dynamic';

export default async function Kalou() {
  const { user, profile, supabase, plus } = await plusSession();
  if (!user || !plus)
    return (
      <Page>
        <TopBar title="Demander à Kalou" back="/assistant" />
        <div className="px-5">
          {!user ? (
            <Empty title="Discute avec Kalou" text="Connecte-toi d’abord." action={<Link href="/connexion?suite=profil" className="btn-violet h-11 text-sm">Se connecter</Link>} />
          ) : (
            <PlusGate title="Pose tes questions à Kalou" text="« J’ai du riz et des tomates, je fais quoi ? », « Que manger ce soir avec 1 500 F ? » : Kalou te répond en tenant compte de ta famille, de tes allergies et des règles d’équilibre." />
          )}
        </div>
      </Page>
    );
  const { data } = await supabase.from('ma2_kalou_messages').select('role, content, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30);
  const history = (data ?? []).reverse().map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
  return (
    <Page>
      <TopBar title="Demander à Kalou" back="/assistant" />
      <div className="px-5">
        <KalouChat history={history} name={profile?.display_name?.split(' ')[0] ?? null} />
      </div>
    </Page>
  );
}
