import type { Metadata } from 'next';
import { getDishes } from '@/lib/data';
import { DishImage, Page, TopBar } from '@/components/ui';

export const metadata: Metadata = { title: 'Crédits photos' };
export const dynamic = 'force-dynamic';

export default async function Credits() {
  const dishes = (await getDishes()).filter((d) => d.image_credit);
  return (
    <Page>
      <TopBar title="Crédits photos" back="/profil" />
      <div className="px-5">
        <p className="mb-3.5 text-[13px] text-gris">Photos de Wikimedia Commons, utilisées selon leur licence. Merci à leurs auteurs.</p>
        <div className="carte">
          {dishes.map((d, i) => (
            <div key={d.id} className={`flex items-center gap-3 px-4 py-3.5 ${i ? 'border-t border-[#f0ecfb]' : ''}`}>
              <DishImage dish={d} className="h-12 w-12 flex-none" rounded="rounded-xl" />
              <span className="min-w-0 flex-1">
                <b className="block text-sm">{d.name}</b>
                <small className="block text-xs text-gris">
                  Photo : {d.image_credit} · {d.image_license}
                </small>
                {d.image_source && (
                  <a href={d.image_source} target="_blank" rel="noopener noreferrer" className="text-[11px] text-violet-d underline">
                    Voir sur Wikimedia Commons
                  </a>
                )}
              </span>
            </div>
          ))}
        </div>
        <p className="mx-1 mt-3.5 text-[11.5px] leading-relaxed text-gris">CC0 : domaine public. CC BY : citer l’auteur. CC BY-SA : citer l’auteur et partager toute version modifiée sous la même licence.</p>
      </div>
    </Page>
  );
}
