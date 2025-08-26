const slugify = require('./slugify');

const STOPWORDS = [
  'de',
  'del',
  'la',
  'las',
  'los',
  'y',
  'e',
  'da',
  'do',
  'dos',
  'van',
  'von',
  'viuda',
  'viudo',
  'di',
  'du',
];

function parseNombreApellido({ nombres, apellidos, nombreCompleto }) {
  if (nombres && apellidos) {
    return {
      nombre: slugify(nombres).split(' ')[0] || 'user', // primer nombre
      apellido: slugify(apellidos).split(' ').filter(Boolean)[0] || 'x', // primer apellido
    };
  }

  const limpio = slugify(nombreCompleto || '');
  const partes = limpio.split(/\s+/).filter(Boolean);

  if (partes.length === 0) {
    return { nombre: 'user', apellido: 'x' };
  }

  // Primer nombre
  const nombre = partes[0];

  // Buscar primer apellido válido
  let apellido = 'x';
  for (let i = 1; i < partes.length; i++) {
    if (!STOPWORDS.includes(partes[i])) {
      apellido = partes[i];
      break;
    }
  }

  return { nombre, apellido };
}

module.exports = { parseNombreApellido };
