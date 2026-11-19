import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCategories, getDish, getSession } from '@/lib/data';
import { DishImage, Page } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { FavButton } from '@/components/FavButton';
import { AddToPlan } from '@/components/AddToPlan';
import { ReportForm } from '@/components/ReportForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = await getDish(slug);
  return { title: r?.dish.name ?? 'Plat' };
}

export default async function Plat({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [r, categories, { user, supabase, allergies }] = await Promise.all([getDish(slug), getCategories(), getSession()]);
  if (!r) notFound();
  const { dish, recipe, nutrition, price } = r;
  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  let fav = false;
  let have: string[] = [];
  if (user) {
    const [{ data: f }, { data: a }] = await Promise.all([
      supabase.from('ma2_favorites').select('dish_id').eq('user_id', user.id).eq('dish_id', dish.id).maybeSingle(),
      supabase.from('ma2_available_ingredients').select('ingredient_id').eq('user_id', user.id),
    ]);
    fav = !!f;
    have = (a ?? []).map((x) => x.ingredient_id as string);
  }
  const warn = dish.allergens.filter((a) => allergies.includes(a));
  const facts = [
    { icon: 'clock' as const, color: '#6C3CF0', value: dish.prep_minutes ? `${dish.prep_minutes} min` : '—', label: 'Durée' },
    { icon: 'users2' as const, color: '#047857', value: dish.servings ? String(dish.servings) : '—', label: 'Portions' },
    { icon: 'bolt' as const, color: '#D9381E', value: dish.difficulty ? dish.difficulty[0].toUpperCase() + dish.difficulty.slice(1) : '—', label: 'Niveau' },
    { icon: 'coin' as const, color: '#B7791F', value: price ? `${price.price_min}–${price.price_max} F` : '—', label: 'Coût estimé' },
  ].filter((f) => f.value !== '—');

  return (
    <Page>
      <div className="relative">
        <DishImage dish={dish} rounded="rounded-none lg:rounded-3xl" className="h-[300px] w-full lg:mt-4 lg:h-[380px]" />
        <Link href="/decouvrir" aria-label="Retour" className="rond absolute left-5 top-5">
          <Icon name="back" size={20} />
        </Link>
        <div className="absolute right-5 top-5">
          <FavButton dishId={dish.id} initial={fav} loggedIn={!!user} size={44} />
        </div>
      </div>
      <article className="relative -mt-7 rounded-t-[28px] bg-lilas px-5 pb-8 pt-5 lg:mt-0">
        <small className="text-xs text-gris">
          {catName[dish.category_id]} · Burkina Faso{dish.community ? ` · Cuisine ${dish.community.toLowerCase()}` : ''}
          {dish.alt_names.length ? ` · Aussi appelé ${dish.alt_names.map((n) => `« ${n} »`).join(', ')}` : ''}
        </small>
        <h1 className="mb-2 mt-1 text-[26px] font-extrabold leading-tight">{dish.name}</h1>
        <p className="text-sm text-encre-2">{dish.description}</p>
        {warn.length > 0 && (
          <div role="alert" className="mt-3 flex items-start gap-2.5 rounded-2xl bg-corail-l px-4 py-3 text-[13px] text-[#8A2512]">
            <Icon name="alert" size={18} color="#B23A1E" />
            <span>Attention : ce plat contient un aliment que tu as signalé ({warn.join(', ')}).</span>
          </div>
        )}
        {facts.length > 0 && <div className="mt-4 grid grid-cols-4 gap-2">
          {facts.map((f) => (
            <div key={f.label} className="carte px-1.5 py-2.5 text-center">
              <span className="flex justify-center">
                <Icon name={f.icon} size={18} color={f.color} width={2.2} />
              </span>
              <b className="mt-1 block text-[13px]">{f.value}</b>
              <small className="text-[10.5px] text-gris">{f.label}</small>
            </div>
          ))}
        </div>}
        {price && <p className="mt-2 text-[11px] text-gris">Coût total {price.unit}, {price.source} le {new Date(price.observed_at).toLocaleDateString('fr-FR')} : les prix varient, ce n’est pas un prix garanti.</p>}

        <h2 className="mb-2.5 mt-6 text-[17px] font-bold">Ingrédients</h2>
        <div className="carte">
          {(dish.dish_ingredients ?? []).map((x, i) => {
            const ok = have.includes(x.ingredient_id);
            return (
              <div key={x.ingredient_id} className={`flex items-center gap-3 px-4 py-3.5 ${i ? 'border-t border-[#f0ecfb]' : ''}`}>
                {user ? (
                  <span className={`flex h-7 w-7 flex-none items-center justify-center rounded-full ${ok ? 'bg-emeraude-l' : 'bg-lilas'}`}>
                    <Icon name={ok ? 'check' : 'plus'} size={14} color={ok ? '#047857' : '#6B6585'} width={2.6} />
                  </span>
                ) : null}
                <span className="flex-1">
                  <b className="block text-sm font-semibold">{x.ingredient.name}</b>
                  {x.is_optional && <small className="text-xs text-gris">Facultatif</small>}
                  {x.substitutes && <small className="block text-xs text-gris">Remplaçable par : {x.substitutes}</small>}
                </span>
                <small className="text-xs font-semibold text-encre-2">{x.quantity ? `${x.quantity} ${x.unit ?? ''}` : ''}</small>
              </div>
            );
          })}
        </div>

        {recipe?.steps.length ? (
          <>
            <h2 className="mb-2.5 mt-6 text-[17px] font-bold">Préparation</h2>
          <ol className="space-y-3">
            {recipe.steps.map((s) => (
              <li key={s.position} className="flex gap-3">
                <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-violet text-[13px] font-bold text-white">{s.position}</span>
                <span className="pt-1 text-[13.5px] leading-relaxed">{s.body}</span>
              </li>
            ))}
          </ol>
          </>
        ) : null}

        {nutrition && (
        <div className="carte mt-4 p-4">
          <b className="text-sm">Nutrition</b>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
              {[
                ['Énergie', nutrition.energy_kcal, 'kcal'],
                ['Protéines', nutrition.protein_g, 'g'],
                ['Glucides', nutrition.carbs_g, 'g'],
                ['Lipides', nutrition.fat_g, 'g'],
                ['Fibres', nutrition.fiber_g, 'g'],
              ]
                .filter((x) => x[1] != null)
                .map(([l, v, u]) => (
                  <div key={l as string} className="rounded-xl bg-lilas p-2">
                    <dt className="text-gris">{l}</dt>
                    <dd className="font-semibold">
                      {v} {u}
                    </dd>
                  </div>
                ))}
            </dl>
          <p className="mt-2 text-[11px] text-gris">Ces informations ne sont pas un avis médical.</p>
        </div>
        )}

        <div className="mt-5 flex gap-2.5">
          <AddToPlan dishId={dish.id} defaultCategory={dish.category_id} loggedIn={!!user} />
        </div>
        <Link href={`/restaurants?plat=${encodeURIComponent(dish.name)}`} className="carte mt-3 flex items-center gap-3 px-4 py-3 text-sm">
          <span className="flex-1"><b>Envie de le manger dehors ?</b><small className="block text-xs text-gris">Restaurants près de toi</small></span>
          <span className="text-violet-d">›</span>
        </Link>
        <ReportForm dishId={dish.id} userId={user?.id ?? null} />
        {dish.image_credit && (
          <p className="mt-5 text-[11px] text-gris">
            Photo : {dish.image_credit} · {dish.image_license} ·{' '}
            <a href={dish.image_source ?? '#'} target="_blank" rel="noopener noreferrer" className="underline">
              Wikimedia Commons
            </a>
          </p>
        )}
      </article>
    </Page>
  );
}
