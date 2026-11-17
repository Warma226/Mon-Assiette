'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from './Toast';

// Clé publique VAPID (publique par nature) : identifie le serveur qui envoie les notifications
const VAPID = 'BMMtPgr5uHuV687K1pTLtLyJaodaYl7fLlveaazUr5pyX1Lzl3fp2vQ-XdvWvNjrxIFoEYtrqte-rcsHWm7Nxz0';
const b64 = (s: string) => {
  const p = (s + '='.repeat((4 - (s.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(p), (c) => c.charCodeAt(0));
};

export function PushToggle() {
  const [state, setState] = useState<'loading' | 'unsupported' | 'denied' | 'off' | 'on'>('loading');
  useEffect(() => {
    (async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return setState('unsupported');
      if (Notification.permission === 'denied') return setState('denied');
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      setState(sub ? 'on' : 'off');
    })();
  }, []);

  async function enable() {
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return setState(perm === 'denied' ? 'denied' : 'off');
      const reg = (await navigator.serviceWorker.getRegistration()) ?? (await navigator.serviceWorker.register('/sw.js'));
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(VAPID) });
      const j = sub.toJSON();
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const { error } = await supabase.from('ma2_push_subscriptions').upsert({ endpoint: j.endpoint!, user_id: data.user!.id, p256dh: j.keys!.p256dh, auth: j.keys!.auth });
      if (error) throw error;
      setState('on');
      toast('Notifications activées sur cet appareil');
    } catch {
      toast('Activation impossible sur cet appareil.', 'erreur');
    }
  }

  async function disable() {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await createClient().from('ma2_push_subscriptions').delete().eq('endpoint', sub.endpoint);
      await sub.unsubscribe();
    }
    setState('off');
    toast('Notifications désactivées sur cet appareil');
  }

  if (state === 'loading') return null;
  return (
    <div className="carte mb-4 flex items-center gap-3 p-4">
      <span className="flex-1 text-[13px]">
        <b className="block text-sm">Notifications sur ce téléphone</b>
        {state === 'unsupported' && <span className="text-gris">Ce navigateur ne les accepte pas. Sur iPhone, ajoute d’abord l’appli à l’écran d’accueil.</span>}
        {state === 'denied' && <span className="text-gris">Bloquées. Autorise-les dans les réglages du navigateur pour ce site.</span>}
        {state === 'off' && <span className="text-gris">Active-les pour recevoir tes rappels.</span>}
        {state === 'on' && <span className="text-emeraude">Activées</span>}
      </span>
      {state === 'off' && <button onClick={enable} className="btn-violet h-10 px-4 text-[13px]">Activer</button>}
      {state === 'on' && <button onClick={disable} className="btn-blanc h-10 px-4 text-[13px]">Désactiver</button>}
    </div>
  );
}
