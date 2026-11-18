import Link from 'next/link';
import type { Metadata } from 'next';
import { plusSession } from '@/lib/plus';
import { Page, TopBar } from '@/components/ui';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'Les menus' };
export const dynamic = 'force-dynamic';

const THEME: Record<string, [string, string]> = {
  moderne: ['bg-gradient-to-br from-[#6C3CF0] to-[#8E6CF5]', 'Moderne'],
  petit_budget: ['bg-gradient-to-br from-[#047857] to-[#10B981]', 'Petit budget'],
  famille: ['bg-gradient-to-br from-[#2F6FD6] to-[#5B9BFF]', 'Famille'],
  ramadan: ['bg-gradient-to-br from-[#1F2A22] to-[#3A4A3E]', 'Ramadan'],
  fete: ['bg-gradient-to-br from-[#D9381E] to-[#FF7A59]', 'Fête'],
  rentree: ['bg-gradient-to-br from-[#B7791F] to-[#FFB020]', 'Rentrée'],
  local: ['bg-gradient-to-br from-[#B7791F] to-[#FFB020]', 'Au quotidien'],
  autre: ['bg-gradient-to-br from-[#5A4FCF] to-[#8E6CF5]', 'Menu'],
};

export default async function Menus() {
  const { supabase, plus } = await plusSession();
  const { data } = await supabase.from('ma2_menus').select('slug, title, subtitle, theme, is_plus, status, items:ma2_menu_items(id)').order('sort');
  const menus = (data ?? []).filter((m) => m.status === 'publie') as unknown as { slug: string; title: string; subtitle: string | null; theme: string; is_plus: boolean; items: { id: string }[] }[];
  return (
    <Page wide>
      <TopBar title="Les menus" />
      <div className="px-5">
        <p className="mb-4 text-[13px] text-gris">Des idées toutes prêtes à ajouter à ton planning en un clic.</p>
        {menus.length === 0 && <p className="carte p-5 text-center text-sm text-gris">Les menus arrivent très bientôt.</p>}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {menus.map((m) => {
            const [bg, label] = THEME[m.theme] ?? THEME.autre;
            const locked = m.is_plus && !plus;
            return (
              <Link key={m.slug} href={`/menus/${m.slug}`} className={`relative flex min-h-[150px] flex-col overflow-hidden rounded-[24px] p-5 text-white ${bg}`}>
                <span className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
                <span className="relative flex items-center gap-2">
                  <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold">{label}</span>
                  {m.is_plus ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFD54A] px-2 py-1 text-[10.5px] font-bold text-encre">
                      {locked ? <Icon name="lock" size={11} width={2.6} /> : <Icon name="bolt" size={11} width={2.6} />} PLUS
                    </span>
                  ) : (
                    <span className="rounded-full bg-white px-2 py-1 text-[10.5px] font-bold text-emeraude">GRATUIT</span>
                  )}
                </span>
                <b className="relative mt-auto pt-6 text-[19px] leading-tight">{m.title}</b>
                {m.subtitle && <small className="relative mt-1 text-[12.5px] opacity-90">{m.subtitle}</small>}
              </Link>
            );
          })}
        </div>
      </div>
    </Page>
  );
}
