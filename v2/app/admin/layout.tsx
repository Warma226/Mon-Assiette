import type { Metadata } from 'next';
import { requireStaff } from '@/lib/admin';
import { Page, TopBar } from '@/components/ui';
import { AdminTabs } from './tabs';

export const metadata: Metadata = { title: 'Administration', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role } = await requireStaff();
  return (
    <Page wide>
      <TopBar title="Administration" back="/profil" right={<span className="pastille">{role === 'admin' ? 'Admin' : 'Éditeur'}</span>} />
      <div className="px-5">
        <AdminTabs admin={role === 'admin'} />
        {children}
      </div>
    </Page>
  );
}
