import Link from 'next/link';
import type { Metadata } from 'next';
import { getPreferences, getSession, isPlus } from '@/lib/data';
import { Empty, Page, TopBar } from '@/components/ui';
import { ProfileForm } from '@/components/ProfileForm';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'Mon profil' };
export const dynamic = 'force-dynamic';

export default async function Profil() {
  const [{ user, profile, allergies, prefs, supabase }, preferences] = await Promise.all([getSession(), getPreferences()]);
  if (!user || !profile)
    return (
      <Page>
        <TopBar title="Mon profil" />
        <div className="px-5">
          <Empty title="Personnalise tes suggestions" text="Crée ton compte pour indiquer tes préférences, tes allergies et ton budget." action={<Link href="/connexion?suite=profil" className="btn-violet h-11 text-sm">Se connecter</Link>} />
          <div className="mt-4 flex justify-center gap-4 text-xs text-gris underline">
            <Link href="/confidentialite">Confidentialité</Link>
            <Link href="/conditions">Conditions</Link>
            <Link href="/credits">Crédits photos</Link>
          </div>
        </div>
      </Page>
    );
  const { data: countries } = await supabase.from('ma2_countries').select('id, name, is_active').order('name');
  const { data: staff } = await supabase.from('ma2_admin_roles').select('role').eq('user_id', user.id).maybeSingle();
  const plus = isPlus(profile);
  const initial = (profile.display_name?.[0] ?? user.email?.[0] ?? 'M').toUpperCase();
  return (
    <Page>
      <TopBar title="Mon profil" />
      <div className="px-5">
        <div className="relative flex items-center gap-3.5 overflow-hidden rounded-3xl bg-violet p-[18px] text-white">
          <span className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
          <span className="flex h-[58px] w-[58px] flex-none items-center justify-center rounded-full bg-white text-[22px] font-bold text-violet-d">{initial}</span>
          <span className="relative min-w-0 flex-1">
            <b className="block truncate text-[19px]">{profile.display_name || 'Mon compte'}</b>
            <small className="block truncate text-[12.5px] opacity-85">{user.email}</small>
          </span>
          <span className={`relative rounded-full px-2.5 py-1 text-[11px] font-semibold ${plus ? 'bg-[#FFD54A] text-encre' : 'bg-white/20'}`}>{plus ? 'Plus' : 'Gratuit'}</span>
        </div>
        <Link href="/abonnement" className="carte mt-3 flex items-center gap-3 px-4 py-3.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-soleil-l">
            <Icon name="bolt" size={20} color="#B7791F" width={2.2} />
          </span>
          <span className="flex-1">
            <b className="block text-sm">Mon abonnement</b>
            <small className="text-xs text-gris">{plus ? `Actif jusqu’au ${new Date(profile.plus_until!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}` : 'Formule gratuite'}</small>
          </span>
          <Icon name="next" size={18} />
        </Link>
        <Link href="/assistant" className="carte mt-3 flex items-center gap-3 px-4 py-3.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-violet">
            <Icon name="sun" size={20} color="#fff" width={2.2} />
          </span>
          <span className="flex-1">
            <b className="block text-sm">Kalou, mon assistant</b>
            <small className="text-xs text-gris">Journée, semaine, courses, budget, rappels, famille</small>
          </span>
          <Icon name="next" size={18} />
        </Link>
        {staff && (
          <Link href="/admin" className="carte mt-3 flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-lilas-2">
              <Icon name="sliders" size={20} color="#6C3CF0" width={2.2} />
            </span>
            <span className="flex-1">
              <b className="block text-sm">Administration</b>
              <small className="text-xs text-gris">{staff.role === 'admin' ? 'Plats, retours, comptes et ventes' : 'Plats et retours'}</small>
            </span>
            <Icon name="next" size={18} />
          </Link>
        )}
        <ProfileForm
          profile={profile}
          countries={(countries ?? []) as { id: string; name: string; is_active: boolean }[]}
          preferences={preferences}
          selectedPrefs={prefs}
          selectedAllergies={allergies}
        />
        <div className="mt-5 flex justify-center gap-4 text-xs text-gris underline">
          <Link href="/confidentialite">Confidentialité</Link>
          <Link href="/conditions">Conditions</Link>
          <Link href="/credits">Crédits photos</Link>
        </div>
      </div>
    </Page>
  );
}
