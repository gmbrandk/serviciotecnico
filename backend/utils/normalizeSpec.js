// 📁 utils/normalizeSpec.js
function normalizeSpec(value) {
  if (!value) return null;

  // Uppercase + quitar tildes/diacríticos
  let s = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

  // Quitar símbolos y paréntesis (pero dejar espacio)
  s = s.replace(/[®™]/g, ' ').replace(/\(.*?\)/g, ' ');

  // Normalizaciones “frase” antes de tokenizar
  s = s
    // “SOLID STATE DRIVE” -> SSD
    .replace(/\bSOLID\s*STATE\s*DRIVE\b/g, 'SSD')
    // “HARD DISK DRIVE” -> HDD
    .replace(/\bHARD\s*DISK\s*DRIVE\b/g, 'HDD')
    // Unificar DDR (DDR 3 / DDR-3 / DDR3L -> DDR3)
    .replace(/\bDDR[\s\-]*3L?\b/g, 'DDR3')
    .replace(/\bDDR[\s\-]*4L?\b/g, 'DDR4');

  // Unificar separadores a espacio
  s = s.replace(/[_\-\/]+/g, ' ');

  // Insertar espacios entre límites dígito↔letra (evita “500GB” -> “500 GB”)
  s = s.replace(/(\d)([A-Z])/g, '$1 $2').replace(/([A-Z])(\d)/g, '$1 $2');

  // Colapsar espacios
  s = s.replace(/\s+/g, ' ').trim();

  // Tokenizar
  let tokens = s.split(' ');

  // Limpieza por token + equivalencias
  const mapToken = (t) => {
    const clean = t.replace(/[^A-Z0-9]/g, '');
    if (!clean) return '';

    // Equivalencias por token
    const dict = {
      GIGABYTE: 'GB',
      MEGABYTE: 'MB',
      GIGA: 'GB',
      MEGA: 'MB',
      GRAPHICS: '', // ruido
      GRAFICAS: '', // ruido
      GRAPHIC: '',
    };

    return dict[clean] ?? clean;
  };

  tokens = tokens.map(mapToken).filter(Boolean);

  // Orden estable: números primero, luego alfabético (para que el orden de entrada no afecte)
  tokens.sort((a, b) => {
    const an = /^\d/.test(a);
    const bn = /^\d/.test(b);
    if (an && !bn) return -1;
    if (!an && bn) return 1;
    return a.localeCompare(b);
  });

  // Devolvemos texto con espacios (para que tu regex de tokens en logs funcione bien)
  return tokens.join(' ');
}

module.exports = normalizeSpec;
