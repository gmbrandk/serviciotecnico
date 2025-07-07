// 📁 helpers/equipos/calcularEspecificacionesEquipo.js

const camposTecnicos = ['ram', 'almacenamiento', 'cpu', 'gpu'];

const calcularEspecificacionesEquipo = (fichaBase = {}, sobrescritos = {}) => {
  const resultado = {};
  let repotenciado = false;

  camposTecnicos.forEach((campo) => {
    const manual = sobrescritos[campo];
    const base = fichaBase?.[campo];

    if (manual !== undefined) {
      // ⚠️ Si hay ficha base y difiere => repotenciado
      if (base !== undefined && manual !== base) {
        repotenciado = true;
      }

      // Siempre se incluye si viene desde input
      resultado[campo] = { valor: manual, fuente: 'manual' };
    } else if (base !== undefined) {
      resultado[campo] = { valor: base, fuente: 'template' };
    }
  });

  return { especificacionesActuales: resultado, repotenciado };
};

module.exports = calcularEspecificacionesEquipo;
