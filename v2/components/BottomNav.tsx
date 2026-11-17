'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from './Icon';

const ITEMS: { href: string; icon: IconName; label: string }[] = [
  { href: '/', icon: 'home', label: 'Accueil' },
  { href: '/decouvrir', icon: 'compass', label: 'Découvrir' },
  { href: '/ingredients', icon: 'bowl', label: 'Ingrédients' },
  { href: '/planning', icon: 'plan', label: 'Planning' },
  { href: '/profil', icon: 'profile', label: 'Profil' },
];

// Navigation principale du cahier (§7) : barre du bas sur mobile, menu latéral sur ordinateur.
export function BottomNav() {
  const path = usePathname();
  const on = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));
  return (
    <>
      <nav aria-label="Navigation principale" className="fixed inset-x-0 bottom-0 z-40 grid h-[84px] grid-cols-5 items-end rounded-t-[26px] bg-white px-1.5 pb-3.5 shadow-[0_-6px_24px_rgba(76,46,170,0.08)] lg:hidden">
        {ITEMS.map((it) =>
          it.href === '/ingredients' ? (
            <Link key={it.href} href={it.href} aria-current={on(it.href) ? 'page' : undefined} className={`relative flex h-[46px] flex-col items-center justify-end text-[10.5px] font-medium ${on(it.href) ? 'text-violet font-semibold' : 'text-gris'}`}>
              <span className="absolute -top-[46px] left-1/2 flex h-[62px] w-[62px] -translate-x-1/2 items-center justify-center rounded-full border-[5px] border-lilas bg-violet shadow-[0_10px_22px_rgba(108,60,240,0.4)]">
                <Icon name="bowl" size={27} color="#fff" width={2.4} />
              </span>
              {it.label}
            </Link>
          ) : (
            <Link key={it.href} href={it.href} aria-current={on(it.href) ? 'page' : undefined} className={`flex h-[46px] flex-col items-center justify-end gap-1 text-[10.5px] font-medium ${on(it.href) ? 'text-violet font-semibold' : 'text-gris'}`}>
              <Icon name={it.icon} size={23} />
              {it.label}
            </Link>
          ),
        )}
      </nav>
      <aside className="fixed left-6 top-6 z-40 hidden w-[230px] rounded-3xl bg-white p-5 shadow-[0_6px_20px_rgba(76,46,170,0.07)] lg:block">
        <Link href="/" className="mb-5 flex items-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br from-violet to-violet-l">
            <img src="/kalou-joie.svg" alt="" width={36} height={36} />
          </span>
          <b className="text-[17px] font-extrabold">
            Mon <span className="text-violet">Assiette</span>
          </b>
        </Link>
        {[...ITEMS.slice(0, 4), { href: '/favoris', icon: 'heart' as IconName, label: 'Favoris' }, ITEMS[4]].map((it) => (
          <Link key={it.href} href={it.href} aria-current={on(it.href) ? 'page' : undefined} className={`flex items-center gap-2.5 rounded-[14px] px-3 py-2.5 text-sm ${on(it.href) ? 'bg-violet font-semibold text-white' : 'text-encre-2'}`}>
            <Icon name={it.icon} size={18} />
            {it.label === 'Ingrédients' ? 'Mes ingrédients' : it.label === 'Planning' ? 'Mon planning' : it.label === 'Profil' ? 'Mon profil' : it.label}
          </Link>
        ))}
      </aside>
    </>
  );
}
