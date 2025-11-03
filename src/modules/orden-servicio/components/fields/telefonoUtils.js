// telefonoUtils.js
export const BANDERA_NEUTRAL =
  'https://upload.wikimedia.org/wikipedia/commons/d/d4/World_Flag_%282004%29.svg';

/**
 * 🔍 Busca el prefijo más preciso según el input.
 * Usa coincidencias por inicio y prioriza el prefijo más largo.
 */
export function buscarPrefijoMasPreciso(input, prefijos) {
  if (!input) return null;

  const limpio = input.replace(/\s+/g, '');
  if (!limpio.startsWith('+')) return null;

  // Buscar coincidencias que empiecen igual
  const coincidencias = prefijos.filter((p) => limpio.startsWith(p.codigo));

  if (coincidencias.length === 0) {
    console.log('❓ Ningún prefijo coincide con', limpio);
    return null;
  }

  // Ordenar por longitud descendente (más largo = más específico)
  coincidencias.sort((a, b) => b.codigo.length - a.codigo.length);

  const match = coincidencias[0];
  console.log(`🌍 Prefijo detectado: ${match.codigo} - ${match.pais}`);
  return match;
}

/**
 * 🧹 Limpia un número eliminando el prefijo y caracteres no numéricos.
 */
export function limpiarNumero(raw, prefijo) {
  let numero = raw;
  if (numero.startsWith(prefijo)) {
    numero = numero.slice(prefijo.length);
  }
  return numero.replace(/\D/g, '');
}
