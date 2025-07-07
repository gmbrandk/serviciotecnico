// 📁 utils/normalizarNombreTecnico.js

const quitarTildes = (texto) =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const generarNombreTecnico = (marca, modelo) => {
  if (!marca || !modelo) return null;

  return quitarTildes(`${marca}-${modelo}`)
    .trim()
    .replace(/\s+/g, '-') // Espacios por guiones
    .replace(/[^a-zA-Z0-9\-]/g, '') // Elimina caracteres especiales
    .toUpperCase();
};

module.exports = generarNombreTecnico;
