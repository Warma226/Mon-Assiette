import type { Metadata } from 'next';
import { Page, TopBar } from '@/components/ui';

export const metadata: Metadata = { title: 'Conditions d’utilisation' };

export default function Conditions() {
  return (
    <Page>
      <TopBar title="Conditions d’utilisation" back="/profil" />
      <article className="space-y-4 px-5 text-[14px] leading-relaxed text-encre-2 [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-encre">
        <p className="text-xs text-gris">Dernière mise à jour : 17 novembre 2026</p>
        <h2>Le service</h2>
        <p>Mon Assiette propose des idées de repas, un catalogue de plats, un planning et des outils pour cuisiner avec ce que tu as. La version gratuite est accessible sans compte. Mon Assiette Plus ajoute des fonctions payantes, décrites dans l’app avant tout paiement.</p>
        <h2>Pas un avis médical</h2>
        <p>Les informations de l’app sont générales. Elles ne remplacent pas l’avis d’un médecin ou d’un professionnel de santé. Les filtres d’allergies dépendent des informations disponibles : vérifie toujours les ingrédients en cas d’allergie.</p>
        <h2>Prix et coûts</h2>
        <p>Les coûts affichés pour les plats sont des estimations locales, jamais des prix garantis.</p>
        <h2>Ton compte</h2>
        <p>Tu es responsable de l’accès à ton adresse e-mail ou à ton compte Google. Tu peux supprimer ton compte quand tu veux.</p>
        <h2>Mon Assiette Plus</h2>
        <p>L’abonnement est payé à l’avance pour une semaine ou un mois, sans prélèvement automatique. Il s’arrête seul à la date de fin.</p>
        <h2>Contenus</h2>
        <p>Les photos de plats viennent en partie de Wikimedia Commons et sont utilisées selon leur licence (voir « Crédits photos »).</p>
        <h2>Contact</h2>
        <p><b>[ADRESSE E-MAIL DE CONTACT]</b></p>
      </article>
    </Page>
  );
}
