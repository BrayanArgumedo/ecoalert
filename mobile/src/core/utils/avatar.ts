// src/core/utils/avatar.ts
// Utilidades para la generación de avatares usando la API de DiceBear.
// Los avatares son imágenes SVG/PNG generadas a partir de un seed de texto,
// lo que garantiza que el mismo seed siempre produce el mismo avatar.

const BASE = 'https://api.dicebear.com/9.x/bottts-neutral/png';

// Construye la URL del avatar a partir del seed y el tamaño deseado en píxeles
export const avatarUrl = (seed: string, size = 120) =>
  `${BASE}?seed=${encodeURIComponent(seed)}&size=${size}`;

// Seeds predefinidos que aparecen en el selector de avatar de la pantalla de perfil.
// El usuario elige uno y ese string se guarda en la BD como avatar_seed.
export const AVATAR_SEEDS = [
  'aurora',   'blaze',   'cosmos',  'drift',
  'ember',    'flux',    'glitch',  'haze',
  'ignite',   'jolt',    'kite',    'lunar',
  'nebula',   'orbit',   'pixel',   'quasar',
  'radiant',  'stellar', 'titan',   'ultra',
  'vector',   'wave',    'xenon',   'zephyr',
];
