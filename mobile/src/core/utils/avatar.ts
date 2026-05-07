const BASE = 'https://api.dicebear.com/9.x/bottts-neutral/png';

export const avatarUrl = (seed: string, size = 120) =>
  `${BASE}?seed=${encodeURIComponent(seed)}&size=${size}`;

// Seeds predefinidos para el selector de avatar en perfil
export const AVATAR_SEEDS = [
  'aurora',   'blaze',   'cosmos',  'drift',
  'ember',    'flux',    'glitch',  'haze',
  'ignite',   'jolt',    'kite',    'lunar',
  'nebula',   'orbit',   'pixel',   'quasar',
  'radiant',  'stellar', 'titan',   'ultra',
  'vector',   'wave',    'xenon',   'zephyr',
];
