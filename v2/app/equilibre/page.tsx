import type { Metadata } from 'next';
import { Page, TopBar } from '@/components/ui';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'Comment Kalou choisit tes repas' };

const RULES: [string, string][] = [
  ['Varier chaque jour', 'Des céréales ou tubercules pour l’énergie, des protéines (légumineuses, poisson, œuf, viande, lait), des légumes et des fruits.'],
  ['Fruits et légumes tous les jours', 'Au moins deux repas avec des légumes ou des feuilles, et au moins un fruit. L’OMS conseille au moins 400 g de fruits et légumes par jour.'],
  ['Des légumineuses plusieurs fois par semaine', 'Haricot (niébé), arachide, sésame, zamnè : de bonnes protéines végétales, plutôt dans un repas principal.'],
  ['Repas principaux complets', 'Au déjeuner et au dîner : une base (tô, riz, igname…), une protéine et des légumes.'],
  ['Petit-déjeuner et collations légers', 'Pas de friture le matin ; aux collations, un fruit plutôt qu’un plat sucré.'],
  ['Léger en fin de soirée', 'À partir de 21 h, l’appli ne propose que des plats légers : un repas lourd, gras ou à base de légumineuses juste avant de dormir se digère mal.'],
  ['Moins de sucre, de sel et de friture', 'Au plus un plat sucré et un plat frit par jour. L’OMS recommande moins de 5 g de sel par jour.'],
  ['Pas deux fois le même plat', 'Jamais le même plat deux fois dans la journée, et le moins possible dans la semaine.'],
  ['Chaque plat à son moment', 'Un plat n’est proposé qu’aux moments de la journée où il se mange habituellement.'],
  ['Ta famille d’abord', 'Les allergies de chaque membre du foyer et tes préférences (végétarien, peu sucré…) sont toujours respectées.'],
];

const SOURCES: [string, string][] = [
  ['OMS — Alimentation saine (aide-mémoire)', 'https://www.who.int/fr/news-room/fact-sheets/detail/healthy-diet'],
  ['FAO — Guides alimentaires de la région Afrique', 'https://www.fao.org/nutrition/education/dietary-guidelines/regions/africa/en/'],
  ['FAO — Guide alimentaire du Bénin (2015)', 'https://www.fao.org/nutrition/education/food-dietary-guidelines/regions/benin'],
  ['FAO — Guide alimentaire du Nigeria', 'https://www.fao.org/nutrition/education/dietary-guidelines/regions/nigeria/en/'],
];

export default function Equilibre() {
  return (
    <Page>
      <TopBar title="Repas équilibrés" />
      <div className="px-5">
        <p className="mb-4 text-[13px] text-gris">Kalou ne choisit pas au hasard. Chaque plat est noté selon ce qu’il apporte à ta journée, en suivant les repères des spécialistes de la nutrition.</p>
        <div className="carte">
          {RULES.map(([t, d], i) => (
            <div key={t} className={`flex gap-3 px-4 py-3.5 ${i ? 'border-t border-[#f0ecfb]' : ''}`}>
              <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-emeraude-l"><Icon name="check" size={14} color="#047857" width={2.6} /></span>
              <span><b className="block text-sm">{t}</b><small className="text-[12.5px] text-gris">{d}</small></span>
            </div>
          ))}
        </div>
        <h2 className="titre-sec mb-2 mt-6">Sources</h2>
        <div className="carte">
          {SOURCES.map(([t, u], i) => (
            <a key={u} href={u} target="_blank" rel="noopener noreferrer" className={`block px-4 py-3 text-[13px] text-violet-d underline ${i ? 'border-t border-[#f0ecfb]' : ''}`}>{t}</a>
          ))}
        </div>
        <p className="mt-4 rounded-2xl bg-soleil-l px-4 py-3 text-[12px] text-[#5A4100]">
          Ces repères concernent les adultes en bonne santé. Pour un bébé, un enfant, une grossesse, une maladie (diabète, hypertension…) ou une allergie grave, demande conseil à un médecin, une sage-femme ou un nutritionniste.
        </p>
      </div>
    </Page>
  );
}
