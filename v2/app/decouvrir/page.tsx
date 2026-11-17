import Link from 'next/link';
import type { Metadata } from 'next';
import { getCategories, getDishes } from '@/lib/data';
import { DishCard, Empty, Page, TopBar } from '@/components/ui';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'Découvrir' };
export const dynamic = 'force-dynamic';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Recherche par plat, ingrédient, pays, catégorie et durée (cahier §5.4)
export default async function Decouvrir({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; duree?: string }> }) {
  const { q = '', cat = '', duree = '' } = await searchParams;
  const [categories, dishes] = await Promise.all([getCategories(), getDishes(true)]);
  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const terms = norm(q).split(/\s+/).filter(Boolean);
  const list = dishes.filter((d) => {
    if (cat && d.category_id !== cat && !d.moments.includes(cat)) return false;
    if (duree === '30' && !(d.prep_minutes && d.prep_minutes <= 30)) return false;
    if (!terms.length) return true;
    const hay = norm(
      [d.name, ...d.alt_names, d.description, d.community ?? '', catName[d.category_id] ?? '', d.country_id === 'bf' ? 'burkina faso' : d.country_id, ...(d.dish_ingredients ?? []).flatMap((x) => [x.ingredient.name, ...x.ingredient.aliases])].join(' '),
    );
    return terms.every((t) => hay.includes(t));
  });
  const href = (p: Record<string, string>) => {
    const sp = new URLSearchParams({ q, cat, duree, ...p });
    [...sp.keys()].forEach((k) => !sp.get(k) && sp.delete(k));
    const s = sp.toString();
    return s ? `/decouvrir?${s}` : '/decouvrir';
  };

  return (
    <Page>
      <TopBar title="Découvrir" />
      <div className="px-5">
        <form action="/decouvrir" role="search" className="champ">
          <Icon name="search" size={20} color="#6B6585" />
          <input name="q" defaultValue={q} placeholder="Un plat, un ingrédient, un pays…" aria-label="Rechercher" enterKeyHint="search" />
          {cat && <input type="hidden" name="cat" value={cat} />}
          {duree && <input type="hidden" name="duree" value={duree} />}
        </form>
        <div className="-mx-5 mt-3.5 flex gap-2 overflow-x-auto px-5 pb-1">
          <Link href={href({ cat: '' })} className={`pastille h-[34px] px-3.5 ${!cat ? 'pastille-on' : 'bg-white'}`}>
            Tout
          </Link>
          {categories.map((c) => (
            <Link key={c.id} href={href({ cat: c.id })} className={`pastille h-[34px] px-3.5 ${cat === c.id ? 'pastille-on' : 'bg-white'}`}>
              {c.name}
            </Link>
          ))}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <Link href={href({ duree: duree ? '' : '30' })} className={`pastille ${duree ? 'pastille-on' : 'bg-white'}`}>
            <Icon name="clock" size={13} color={duree ? '#fff' : '#6C3CF0'} /> Moins de 30 min
          </Link>
          <span className="pastille bg-white">
            <Icon name="globe" size={13} color="#D9381E" /> Burkina Faso
          </span>
        </div>
        <div className="mb-3 mt-6 flex items-center justify-between">
          <h2 className="titre-sec">{q ? `Résultats pour « ${q} »` : 'Plats du Burkina'}</h2>
          <small className="text-gris">
            {list.length} plat{list.length > 1 ? 's' : ''}
          </small>
        </div>
        {list.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((d) => (
              <DishCard key={d.id} dish={d} categoryName={catName[d.category_id]} />
            ))}
          </div>
        ) : (
          <Empty
            title="Aucun plat trouvé"
            text={duree ? 'Les durées de préparation sont en cours de vérification : ce filtre sera bientôt plus utile.' : 'Essaie un autre mot : un plat, un ingrédient ou un moment de la journée.'}
            action={
              <Link href="/decouvrir" className="btn-violet h-11 text-sm">
                Voir tous les plats
              </Link>
            }
          />
        )}
      </div>
    </Page>
  );
}
