// whitelistNombres.js
// Lista de nombres válidos que pueden parecer ruido o repetición,
// pero son perfectamente reales o comunes.

export const NOMBRES_WHITELIST = [
  // --- Nombres comunes ---
  'ana',
  'maria',
  'jose',
  'juan',
  'luis',
  'carlos',
  'pedro',
  'rosa',
  'carmen',
  'paula',
  'sofia',
  'marta',
  'david',
  'javier',
  'andres',
  'fernando',
  'diego',
  'cristian',
  'gabriel',
  'jorge',

  // --- Nombres con repeticiones naturales ---
  'anna',
  'jojo',
  'lulu',
  'kaka', // algunos usados internacionalmente

  // --- Casos compuestos comunes ---
  'ana maria',
  'jose luis',
  'juan carlos',
  'maria jose',
  'rosa maria',

  // --- Nombres extranjeros o que pueden confundir ---
  'lee',
  'kim',
  'liu',
  'nguyen',
  'ali',
  'omar',
  'ivan',
  'nina',
];
