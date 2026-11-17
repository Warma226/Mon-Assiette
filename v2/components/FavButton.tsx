'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from './Toast';

export function FavButton({ dishId, initial, loggedIn, size = 40 }: { dishId: string; initial: boolean; loggedIn: boolean; size?: number }) {
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!loggedIn) {
      router.push('/connexion?suite=favoris');
      return;
    }
    const next = !on;
    setOn(next);
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return router.push('/connexion');
    const { error } = next
      ? await supabase.from('ma2_favorites').insert({ user_id: uid, dish_id: dishId })
      : await supabase.from('ma2_favorites').delete().eq('user_id', uid).eq('dish_id', dishId);
    if (error && error.code !== '23505') {
      setOn(!next);
      toast('Impossible pour le moment. Vérifie ta connexion.', 'erreur');
      return;
    }
    toast(next ? 'Ajouté à tes favoris' : 'Retiré de tes favoris');
    start(() => router.refresh());
  }

  return (
    <button type="button" onClick={toggle} disabled={pending} aria-pressed={on} aria-label={on ? 'Retirer des favoris' : 'Ajouter aux favoris'} className="flex items-center justify-center rounded-full bg-white shadow-[0_4px_14px_rgba(76,46,170,0.12)]" style={{ width: size, height: size }}>
      <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill={on ? '#D9381E' : 'none'} stroke="#D9381E" strokeWidth={2.2} strokeLinejoin="round" aria-hidden="true">
        <path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z" />
      </svg>
    </button>
  );
}
