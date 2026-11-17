import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mon Assiette',
    short_name: 'Mon Assiette',
    description: 'Mieux choisir. Mieux manger.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F4F1FF',
    theme_color: '#6C3CF0',
    lang: 'fr',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
