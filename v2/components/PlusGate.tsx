import Link from 'next/link';
import { Icon, type IconName } from './Icon';

// Écran affiché à la place d'une fonction réservée à Plus
export function PlusGate({ title, text, perks }: { title: string; text: string; perks?: [IconName, string][] }) {
  return (
    <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-violet to-[#8E6CF5] p-5 text-white">
      <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <span className="relative inline-flex items-center gap-1.5 rounded-full bg-[#FFD54A] px-2.5 py-1 text-[11px] font-bold text-encre">
        <Icon name="bolt" size={12} width={2.6} /> PLUS
      </span>
      <h2 className="relative mt-2.5 text-[21px] font-extrabold leading-tight">{title}</h2>
      <p className="relative mt-1 text-[13px] opacity-90">{text}</p>
      {perks && (
        <ul className="relative mt-3 space-y-2">
          {perks.map(([ic, t]) => (
            <li key={t} className="flex items-center gap-2.5 text-[13px]">
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white/15"><Icon name={ic} size={15} color="#fff" width={2.2} /></span>
              {t}
            </li>
          ))}
        </ul>
      )}
      <Link href="/abonnement" className="btn-soleil relative mt-4 h-11 w-full text-sm">Découvrir Plus · dès 650 F</Link>
      <img src="/kalou-clin.svg" alt="" width={86} height={86} className="absolute -bottom-1 right-1 opacity-90 max-sm:hidden" />
    </section>
  );
}

export const PLUS_PERKS: [IconName, string][] = [
  ['sun', 'Ta journée prête chaque matin, selon ton budget et ta famille'],
  ['plan', 'La semaine complète en 1 clic, sans répétition'],
  ['cart', 'La liste de courses automatique, à partager par WhatsApp'],
  ['wallet', 'Le suivi de ton budget nourriture'],
  ['bell', 'Des rappels : repas, eau, décongélation, marché'],
  ['send', 'Kalou répond à tes questions en discussion'],
  ['bowl', 'Tous les menus : modernes, fête, Ramadan, famille…'],
  ['users', 'Plusieurs profils dans la famille, avec leurs allergies'],
];
