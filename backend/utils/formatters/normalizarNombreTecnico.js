// 📁 helpers/equipos/generarNombreTecnico.js

const normalizar = (texto) => {
  return texto
    ?.toUpperCase()
    .normalize('NFD') // elimina tildes
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9\- ]/gi, '')
    .replace(/\s+/g, '-') // espacios por guiones
    .trim();
};

/**
 * Genera un nombre técnico estandarizado como: "LENOVO-LEGION-Y545-81Q6"
 * @param {string} marca
 * @param {string} modelo
 * @returns {string|null}
 */
const generarNombreTecnico = (marca, modelo) => {
  if (!modelo) return null;
  const partes = [marca, modelo].filter(Boolean).map(normalizar);
  return partes.join('-');
};

module.exports = generarNombreTecnico;
