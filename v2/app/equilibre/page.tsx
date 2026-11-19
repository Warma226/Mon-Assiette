import type { Metadata } from 'next';
import { Page, TopBar } from '@/components/ui';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'Comment Kalou choisit tes repas' };

// Chaque règle indique d'où elle vient : recommandation officielle, ou choix de l'appli pour l'appliquer au quotidien.
const RULES: [string, string, string][] = [
  ['Varier chaque jour', 'Des céréales ou tubercules pour l’énergie, des protéines (légumineuses, poisson, œuf, viande, lait), des légumes et des fruits.', 'OMS et guides alimentaires de la FAO'],
  ['Fruits et légumes tous les jours', 'Au moins 400 g de fruits et légumes par jour (environ 5 portions) ; l’igname, le manioc et la patate douce n’en font pas partie. Dans l’appli : au moins deux repas avec des légumes et au moins un fruit.', 'Recommandation de l’OMS'],
  ['Moins de sucre et de sel', 'Sucres libres : moins de 10 % de l’énergie de la journée. Sel : moins de 5 g par jour, soit environ une cuillère à café. Dans l’appli : au plus un plat sucré par jour.', 'Recommandation de l’OMS'],
  ['Des légumineuses régulièrement', 'Haricot (niébé), lentilles, arachide : l’OMS les compte dans une alimentation saine. Dans l’appli : plusieurs fois par semaine, plutôt dans un repas principal.', 'OMS · rythme choisi par l’appli'],
  ['Repas principaux complets', 'Au déjeuner et au dîner : une base (tô, riz, igname…), une protéine et des légumes.', 'Guides alimentaires de la FAO (Bénin, Nigeria)'],
  ['Dîner tardif léger', 'La digestion réchauffe le corps, d’autant plus que le repas est lourd et riche en protéines, ce qui gêne l’endormissement. Quand le dîner est pris à partir de 21 h, l’appli ne propose que des plats légers.', 'Institut national du sommeil et de la vigilance (France)'],
  ['Peu de friture', 'Au plus un plat frit par jour, évité le matin et jamais proposé tard le soir.', 'Règle de l’appli (l’OMS conseille de limiter les graisses)'],
  ['Pas deux fois le même plat', 'Jamais le même plat deux fois dans la journée, et le moins possible dans la semaine.', 'Règle de l’appli'],
  ['Chaque plat à son moment', 'Un plat n’est proposé qu’aux moments de la journée où il se mange habituellement.', 'Règle de l’appli'],
  ['Ta famille d’abord', 'Les allergies de chaque membre du foyer et tes préférences (végétarien, peu sucré…) sont toujours respectées.', 'Règle de l’appli'],
];

const SOURCES: [string, string][] = [
  ['OMS — Alimentation saine (aide-mémoire)', 'https://www.who.int/fr/news-room/fact-sheets/detail/healthy-diet'],
  ['OMS — Réduire la consommation de sel', 'https://www.who.int/fr/news-room/fact-sheets/detail/salt-reduction'],
  ['FAO — Guides alimentaires de la région Afrique', 'https://www.fao.org/nutrition/education/dietary-guidelines/regions/africa/en/'],
  ['FAO — Guide alimentaire du Bénin (2015)', 'https://www.fao.org/nutrition/education/food-dietary-guidelines/regions/benin'],
  ['FAO — Guide alimentaire du Nigeria', 'https://www.fao.org/nutrition/education/dietary-guidelines/regions/nigeria/en/'],
  ['INSV — Sommeil et nutrition (carnet n° 9)', 'https://institut-sommeil-vigilance.org/wp-content/uploads/2020/02/INSV-Carnet-9-sommeil-et-nutrition.pdf'],
];

export default function Equilibre() {
  return (
    <Page>
      <TopBar title="Repas équilibrés" />
      <div className="px-5">
        <p className="mb-4 text-[13px] text-gris">Kalou ne choisit pas au hasard. Chaque plat est noté selon ce qu’il apporte à ta journée, en suivant les recommandations de l’OMS et des guides alimentaires. Pour chaque règle, la source est indiquée : en vert une recommandation officielle, en violet un choix de l’appli pour l’appliquer au quotidien.</p>
        <div className="carte">
          {RULES.map(([t, d, src], i) => (
            <div key={t} className={`flex gap-3 px-4 py-3.5 ${i ? 'border-t border-[#f0ecfb]' : ''}`}>
              <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-emeraude-l"><Icon name="check" size={14} color="#047857" width={2.6} /></span>
              <span><b className="block text-sm">{t}</b><small className="block text-[12.5px] text-gris">{d}</small><small className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${src.startsWith('Règle') ? 'bg-lilas-2 text-violet-d' : 'bg-emeraude-l text-emeraude'}`}>Source : {src}</small></span>
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
