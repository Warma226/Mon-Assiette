'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Icon } from './Icon';
import { toast } from './Toast';

type Place = { id: string; name: string; address: string | null; type: string | null; rating: number | null; ratings: number | null; price: number | null; openNow: boolean | null; url: string | null; distance: number | null };
const ERR: Record<string, string> = {
  not_configured: 'La recherche de restaurants n’est pas encore ouverte. Réessaie bientôt.',
  quota: 'Tu as atteint le nombre de recherches du jour.',
  login: 'Reconnecte-toi pour chercher des restaurants.',
  google: 'Google ne répond pas pour le moment. Réessaie.',
};

// Carte Google (Maps Embed API : gratuite, sans limite d'affichage). Clé publique, restreinte au site.
const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY ?? '';

export function Restaurants({ plus, favorites, initialQuery = '' }: { plus: boolean; favorites: string[]; initialQuery?: string }) {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [openNow, setOpenNow] = useState(false);
  const [price, setPrice] = useState(0);
  const [favs, setFavs] = useState(new Set(favorites));
  const [left, setLeft] = useState<number | null>(null);
  const [selected, setSelected] = useState<Place | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const mapSrc = !MAPS_KEY || !pos
    ? null
    : selected
      ? `https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&language=fr&q=place_id:${encodeURIComponent(selected.id)}`
      : `https://www.google.com/maps/embed/v1/search?key=${MAPS_KEY}&language=fr&zoom=14&center=${pos.lat},${pos.lng}&q=${encodeURIComponent((query.trim() || 'restaurants') + ' restaurant')}`;

  function show(p: Place) {
    setSelected(p);
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function locate(): Promise<{ lat: number; lng: number }> {
    if (pos) return Promise.resolve(pos);
    return new Promise((res, rej) => {
      if (!navigator.geolocation) return rej(new Error('geo'));
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const v = { lat: p.coords.latitude, lng: p.coords.longitude };
          setPos(v);
          res(v);
        },
        () => rej(new Error('geo')),
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
      );
    });
  }

  async function search() {
    setBusy(true);
    try {
      const p = await locate();
      const { data, error } = await createClient().functions.invoke('ma2-places', { body: { ...p, query, openNow, price } });
      let code: string | undefined = data?.error;
      if (error && 'context' in error && error.context instanceof Response) code = (await error.context.json().catch(() => null))?.error;
      if (!data?.places) {
        toast(ERR[code ?? ''] ?? 'Recherche impossible. Réessaie.', 'erreur');
      } else {
        setPlaces(data.places);
        setLeft(data.left);
        setSelected(null);
      }
    } catch {
      toast('Autorise la localisation pour voir les restaurants autour de toi.', 'erreur');
    }
    setBusy(false);
  }

  async function fav(p: Place) {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    if (favs.has(p.id)) {
      await supabase.from('ma2_restaurant_favorites').delete().eq('user_id', data.user.id).eq('place_id', p.id);
      setFavs((s) => { const n = new Set(s); n.delete(p.id); return n; });
    } else {
      const { error } = await supabase.from('ma2_restaurant_favorites').insert({ user_id: data.user.id, place_id: p.id, name: p.name.slice(0, 120) });
      if (error) return toast('Ajout impossible.', 'erreur');
      setFavs((s) => new Set(s).add(p.id));
      toast('Ajouté à tes restaurants favoris');
    }
  }

  const km = (m: number | null) => (m === null ? '' : m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`);
  return (
    <>
      <div className="carte p-4">
        {plus ? (
          <>
            <label className="champ h-11"><Icon name="search" size={17} color="#6B6585" /><span className="sr-only">Plat ou type de cuisine</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Un plat ? (riz gras, poulet braisé, pizza…)" maxLength={80} />
            </label>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <button type="button" onClick={() => setOpenNow((v) => !v)} className={`pastille ${openNow ? 'pastille-on' : ''}`}>Ouvert maintenant</button>
              {[1, 2, 3].map((n) => (
                <button key={n} type="button" onClick={() => setPrice(price === n ? 0 : n)} className={`pastille ${price === n ? 'pastille-on' : ''}`}>{'F'.repeat(n)} max</button>
              ))}
            </div>
          </>
        ) : (
          <p className="text-[13px] text-gris">
            Les restaurants les plus proches de toi. Avec <Link href="/abonnement" className="font-semibold text-violet-d underline">Plus</Link>, cherche un plat précis, filtre par prix ou « ouvert maintenant » et garde tes adresses favorites.
          </p>
        )}
        <button onClick={search} disabled={busy} className="btn-violet mt-3 h-11 w-full text-sm">
          <Icon name="market" size={16} color="#fff" /> {busy ? 'Recherche…' : places ? 'Relancer la recherche' : 'Trouver autour de moi'}
        </button>
        {left !== null && <small className="mt-2 block text-center text-[11px] text-gris">{left} recherche{left > 1 ? 's' : ''} restante{left > 1 ? 's' : ''} aujourd’hui</small>}
      </div>

      {mapSrc && places && (
        <div ref={mapRef} className="carte mt-3 scroll-mt-4 overflow-hidden p-0">
          <iframe
            key={mapSrc}
            src={mapSrc}
            title={selected ? `Carte : ${selected.name}` : 'Carte des restaurants autour de toi'}
            className="block h-[300px] w-full border-0 lg:h-[380px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          {selected && (
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 text-[12.5px]">
              <b className="truncate">{selected.name}</b>
              <button type="button" onClick={() => setSelected(null)} className="flex-none font-semibold text-violet-d">Tous les restaurants</button>
            </div>
          )}
        </div>
      )}
      {places && places.length === 0 && <p className="carte mt-3 p-4 text-center text-[13px] text-gris">Aucun restaurant trouvé ici. Essaie une autre recherche.</p>}
      {places && places.length > 0 && (
        <div className="carte mt-3">
          {places.map((p, i) => (
            <div key={p.id} className={`flex items-start gap-3 px-4 py-3.5 ${i ? 'border-t border-[#f0ecfb]' : ''}`}>
              <span className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-lilas"><Icon name="market" size={18} color="#6C3CF0" /></span>
              <span className="min-w-0 flex-1">
                <b className="block text-sm">{p.name}</b>
                <small className="block text-xs text-gris">
                  {[p.type, km(p.distance), p.price ? 'F'.repeat(p.price) : null].filter(Boolean).join(' · ')}
                </small>
                <small className="block text-xs">
                  {p.rating ? <span className="text-[#B7791F]">★ {p.rating.toFixed(1).replace('.', ',')}</span> : null}
                  {p.ratings ? <span className="text-gris"> ({p.ratings} avis)</span> : null}
                  {p.openNow !== null && <span className={p.openNow ? 'ml-1.5 text-emeraude' : 'ml-1.5 text-corail'}>{p.openNow ? 'Ouvert' : 'Fermé'}</span>}
                </small>
                {p.address && <small className="block truncate text-[11.5px] text-gris">{p.address}</small>}
                <span className="mt-1.5 flex flex-wrap gap-2">
                  {mapSrc && <button type="button" onClick={() => show(p)} className={`pastille h-7 ${selected?.id === p.id ? 'pastille-on' : 'bg-white text-violet-d ring-1 ring-ligne'}`}>Voir sur la carte</button>}
                  {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="pastille h-7 bg-white text-violet-d ring-1 ring-ligne">Itinéraire</a>}
                  {plus && (
                    <button onClick={() => fav(p)} className={`pastille h-7 ${favs.has(p.id) ? 'pastille-on' : ''}`} aria-pressed={favs.has(p.id)}>
                      <Icon name="heart" size={12} /> {favs.has(p.id) ? 'Favori' : 'Garder'}
                    </button>
                  )}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}
      {places && <p className="mt-2 text-right text-[10.5px] text-gris">Données fournies par Google</p>}
    </>
  );
}
