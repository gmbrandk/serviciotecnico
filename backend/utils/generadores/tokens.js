// utils/generadores/tokens.js
const normalizar = (texto = '') =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

function generarTokens(...campos) {
  const set = new Set();
  campos.forEach((str) => {
    normalizar(str)
      .split(' ')
      .forEach((w) => w && set.add(w));
  });
  return Array.from(set);
}

module.exports = generarTokens;
