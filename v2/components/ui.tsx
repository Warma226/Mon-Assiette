import Link from 'next/link';
import { Icon, type IconName } from './Icon';
import type { Dish } from '@/lib/data';

const TINTS = ['#FFF1E6', '#FFF6D6', '#E7F6EC', '#F1ECFF'];
const ICONS: Record<string, IconName> = { petit_dejeuner: 'sun', collation: 'fruit', dejeuner: 'bowl', gouter: 'fruit', diner: 'moon' };

export function TopBar({ title, back = '/', right }: { title: string; back?: string; right?: React.ReactNode }) {
  return (
    <header className="flex items-center gap-3 px-5 pb-2.5 pt-5">
      <Link href={back} aria-label="Retour" className="rond">
        <Icon name="back" size={20} />
      </Link>
      <h1 className="flex-1 text-[22px] font-bold">{title}</h1>
      {right ?? <span className="w-11" />}
    </header>
  );
}

export function DishImage({ dish, className = '', rounded = 'rounded-[18px]' }: { dish: Pick<Dish, 'name' | 'image_url' | 'category_id'>; className?: string; rounded?: string }) {
  if (dish.image_url) {
    return <img src={dish.image_url} alt={dish.name} loading="lazy" className={`block object-cover ${rounded} ${className}`} />;
  }
  const tint = TINTS[dish.name.length % TINTS.length];
  return (
    <span className={`flex items-center justify-center ${rounded} ${className}`} style={{ background: tint }} role="img" aria-label={dish.name}>
      <Icon name={ICONS[dish.category_id] ?? 'bowl'} size={40} color="#B7791F" width={1.8} />
    </span>
  );
}

export function DishCard({ dish, categoryName }: { dish: Dish; categoryName?: string }) {
  return (
    <Link href={`/plat/${dish.slug}`} className="carte block p-2.5">
      <DishImage dish={dish} className="h-28 w-full" />
      <b className="mt-2 block text-sm leading-snug">{dish.name}</b>
      <small className="block text-[11.5px] text-gris">
        {categoryName}
        {dish.prep_minutes ? ` · ${dish.prep_minutes} min` : ''}
      </small>
    </Link>
  );
}

export function Empty({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="carte p-6 text-center">
      <img src="/kalou-clin.svg" alt="" width={96} height={96} className="mx-auto" />
      <b className="mt-1.5 block text-base">{title}</b>
      <p className="mx-auto mb-3.5 mt-1 max-w-xs text-[13px] text-gris">{text}</p>
      {action}
    </div>
  );
}

export function Page({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return <main className={`mx-auto min-h-dvh w-full pb-32 lg:pb-12 lg:pl-[280px] lg:pr-6 lg:pt-4 ${wide ? 'max-w-[1440px]' : 'max-w-[1100px]'}`}>{children}</main>;
}
