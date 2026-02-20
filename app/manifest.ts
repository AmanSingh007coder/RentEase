// src/app/manifest.ts
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RentEase',
    short_name: 'RentEase',
    description: 'Never fight over security deposits again.',
    start_url: '/',
    display: 'standalone', // Makes it feel like a real app
    background_color: '#ffffff',
    theme_color: '#0052CC',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  }
}