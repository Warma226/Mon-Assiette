import Link from 'next/link';
import type { Metadata } from 'next';
import { getSession, isPlus } from '@/lib/data';
import { Empty, Page, TopBar } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { LicenseForm } from '@/components/LicenseForm';

export const metadata: Metadata = { title: 'Mon abonnement' };
export const dynamic = 'force-dynamic';

// Pages de paiement Chariow (mêmes produits que la première version)
const OFFERS = [
  { id: 'semaine', name: '1 semaine', price: '650 F CFA', note: '7 jours de Plus', url: 'https://otbbljjy.mychariow.shop/prd_oirgyxlr/checkout' },
  { id: 'mois', name: '1 mois', price: '2 500 F CFA', note: '30 jours de Plus', url: 'https://otbbljjy.mychariow.shop/prd_w3fidn6g' },
];

const FEATURES = ['Planning avancé sur 7 jours', 'Liste de courses automatique', 'Roue de Kalou illimitée', 'Gestion avancée du budget', 'Recommandations approfondies'];

export default async function Abonnement() {
  const { user, profile } = await getSession();
  if (!user || !profile)
    return (
      <Page>
        <TopBar title="Mon abonnement" back="/profil" />
        <div className="px-5">
          <Empty title="Connecte-toi d’abord" text="Ton abonnement est lié à ton compte." action={<Link href="/connexion?suite=profil" className="btn-violet h-11 text-sm">Se connecter</Link>} />
        </div>
      </Page>
    );
  const plus = isPlus(profile);
  const until = profile.plus_until ? new Date(profile.plus_until) : null;
  const days = until ? Math.max(0, Math.ceil((until.getTime() - Date.now()) / 86400000)) : 0;
  return (
    <Page>
      <TopBar title="Mon abonnement" back="/profil" />
      <div className="px-5">
        <section className={`relative flex items-center gap-3.5 overflow-hidden rounded-[26px] p-5 text-white ${plus ? 'bg-violet' : 'bg-gradient-to-br from-[#1F2A22] to-[#3A4A3E]'}`}>
          <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <span className="relative flex-1">
            <small className="text-[11.5px] font-semibold tracking-wide opacity-90">{plus ? 'ACTIF' : 'FORMULE GRATUITE'}</small>
            <b className="my-1 block text-[22px]">{plus ? 'Mon Assiette Plus' : 'Mon Assiette'}</b>
            <small className="text-[12.5px] opacity-90">{plus && until ? `Jusqu’au ${until.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}` : 'Suggestions, catalogue, recherche et favoris : gratuits.'}</small>
          </span>
          {plus ? (
            <span className="relative flex h-24 w-24 flex-none flex-col items-center justify-center rounded-full border-[8px] border-[#FFD54A]">
              <b className="text-[28px] leading-none">{days}</b>
              <small className="text-[10px]">jours</small>
            </span>
          ) : (
            <img src="/kalou-joie.svg" alt="" width={90} height={90} className="relative" />
          )}
        </section>
        <h2 className="titre-sec mb-3 mt-6">Avec Plus</h2>
        <div className="carte">
          {FEATURES.map((t, i) => (
            <div key={t} className={`flex items-center gap-3 px-4 py-3.5 ${i ? 'border-t border-[#f0ecfb]' : ''}`}>
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-lilas-2">
                <Icon name="check" size={16} color="#6C3CF0" width={2.4} />
              </span>
              <span className="text-sm">{t}</span>
            </div>
          ))}
        </div>
        <h2 className="titre-sec mb-1 mt-6">{plus ? 'Prolonger' : 'Passer à Plus'}</h2>
        <p className="mb-3 text-[12.5px] text-gris">Paie sur la page sécurisée de Chariow (Mobile Money ou carte), puis colle ta clé ci-dessous. Les jours s’ajoutent à ceux qui restent.</p>
        <div className="grid grid-cols-2 gap-3">
          {OFFERS.map((o) => (
            <a key={o.id} href={o.url} target="_blank" rel="noopener noreferrer" className="carte flex flex-col p-4">
              <small className="text-xs font-semibold text-violet-d">{o.name}</small>
              <b className="mt-1 text-lg">{o.price}</b>
              <small className="text-xs text-gris">{o.note}</small>
              <span className="btn-violet mt-3 h-10 text-[13px]">Payer</span>
            </a>
          ))}
        </div>
        <LicenseForm />
        <ol className="carte mt-3 space-y-2.5 p-4 text-[13px]">
          <li><b>1.</b> Choisis ta formule et paie sur Chariow.</li>
          <li><b>2.</b> Copie la clé affichée après le paiement (elle arrive aussi par e-mail).</li>
          <li><b>3.</b> Colle-la ici : Plus s’active sur ton compte, sur tous tes appareils.</li>
        </ol>
        <p className="mt-3 text-center text-[11.5px] text-gris">Paiements traités par Chariow. Prix en F CFA. Aucun prélèvement automatique.</p>
      </div>
    </Page>
  );
}
