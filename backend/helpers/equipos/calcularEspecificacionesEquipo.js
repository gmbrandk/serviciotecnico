// 📁 helpers/equipos/calcularEspecificacionesEquipo.js

const camposTecnicos = ['ram', 'almacenamiento', 'cpu', 'gpu'];

const calcularEspecificacionesEquipo = (fichaBase = {}, sobrescritos = {}) => {
  const resultado = {};
  let repotenciado = false;

  camposTecnicos.forEach((campo) => {
    const manual = sobrescritos[campo];
    const base = fichaBase?.[campo];

    if (manual && manual !== base) {
      resultado[campo] = { valor: manual, fuente: 'manual' };
      repotenciado = true;
    } else if (base) {
      resultado[campo] = { valor: base, fuente: 'template' };
    }
  });

  return { especificacionesActuales: resultado, repotenciado };
};

module.exports = calcularEspecificacionesEquipo;
