import type { Metadata } from 'next';
import { Page, TopBar } from '@/components/ui';

export const metadata: Metadata = { title: 'Confidentialité' };

const MAJ = '17 novembre 2026';

export default function Confidentialite() {
  return (
    <Page>
      <TopBar title="Confidentialité" back="/profil" />
      <article className="prose-sm space-y-4 px-5 text-[14px] leading-relaxed text-encre-2 [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-encre">
        <p className="text-xs text-gris">Dernière mise à jour : {MAJ}</p>
        <p>Mon Assiette t’aide à choisir quoi manger. Nous collectons seulement ce qui sert à ce service, et nous ne vendons aucune donnée.</p>
        <h2>Ce que nous enregistrons</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li><b>Ton compte :</b> ton adresse e-mail, et ton nom si tu te connectes avec Google.</li>
          <li><b>Ton profil alimentaire, si tu le remplis :</b> prénom ou pseudo, pays, ville, budget indicatif, nombre de personnes, préférences et allergies déclarées.</li>
          <li><b>Ce que tu fais dans l’app :</b> favoris, planning de repas, ingrédients disponibles, messages que tu nous envoies.</li>
        </ul>
        <p>Sans compte, tes ingrédients cochés restent seulement sur ton téléphone.</p>
        <h2>À quoi ça sert</h2>
        <p>À te proposer des plats adaptés à l’heure, à ton pays, à tes goûts et à tes allergies, et à retrouver tes favoris et ton planning sur tous tes appareils. Les allergies et préférences servent uniquement à filtrer les plats : ce n’est pas un avis médical.</p>
        <h2>Qui y a accès</h2>
        <p>Tes données sont stockées chez Supabase (base de données) et l’app est hébergée par Vercel. Chaque personne ne peut voir que ses propres données. L’équipe Mon Assiette n’accède à un compte que pour résoudre un problème que tu signales.</p>
        <p>Il n’y a pas de publicité dans l’app pour le moment. Si elle arrive, tes données de santé ou d’allergies ne seront jamais utilisées pour cibler des annonces.</p>
        <h2>Paiements</h2>
        <p>Les paiements de Mon Assiette Plus sont traités par notre prestataire de paiement. Nous ne voyons ni ne gardons ton numéro de carte ou de Mobile Money.</p>
        <h2>Tes droits</h2>
        <p>Tu peux à tout moment modifier ton profil, retirer tes favoris et ton planning, ou demander la suppression complète de ton compte en écrivant à l’adresse ci-dessous. Nous répondons sous 30 jours.</p>
        <h2>Contact</h2>
        <p>Pour toute question : <b>[ADRESSE E-MAIL DE CONTACT]</b></p>
      </article>
    </Page>
  );
}
