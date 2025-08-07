const quitarTildes = require('./quitarTildes');

const normalizarTexto = (texto) => {
  if (!texto || typeof texto !== 'string') return '';
  return quitarTildes(texto.trim()).replace(/\s+/g, ' ');
};

module.exports = normalizarTexto;
