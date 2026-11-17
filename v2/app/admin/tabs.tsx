'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminTabs({ admin }: { admin: boolean }) {
  const path = usePathname();
  const tabs = [
    ['/admin', 'Tableau de bord'],
    ['/admin/plats', 'Plats'],
    ['/admin/menus', 'Menus'],
    ['/admin/retours', 'Retours'],
    ...(admin ? [['/admin/comptes', 'Comptes et équipe'], ['/admin/ventes', 'Ventes']] : []),
  ];
  return (
    <nav className="-mx-5 mb-4 flex gap-2 overflow-x-auto px-5 pb-1" aria-label="Sections admin">
      {tabs.map(([href, label]) => {
        const on = href === '/admin' ? path === '/admin' : path.startsWith(href);
        return (
          <Link key={href} href={href} className={`pastille ${on ? 'pastille-on' : ''}`} aria-current={on ? 'page' : undefined}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Notice({ ok, err }: { ok?: string; err?: string }) {
  if (!ok && !err) return null;
  return <p className={`mb-3 rounded-2xl px-4 py-3 text-[13px] font-medium ${err ? 'bg-[#FDECE8] text-corail' : 'bg-[#E7F6EC] text-emeraude'}`} role="status">{err ?? ok}</p>;
}
