/**
 * 🧠 Calcula calificación base del cliente según sus órdenes.
 * Función pura: sin efectos secundarios.
 */
const calcularCalificacionBase = (ordenes) => {
  if (!ordenes.length) return 'regular';

  const buenas = ordenes.filter((os) => os.estadoFinal === 'reparado').length;
  const malas = ordenes.filter(
    (os) => os.estadoFinal === 'no_reparado' || os.retiroSinReparar
  ).length;
  const total = ordenes.length;

  const porcentajeBueno = (buenas / total) * 100;

  if (porcentajeBueno >= 90 && total >= 5) return 'muy_bueno';
  if (porcentajeBueno >= 70) return 'bueno';
  if (porcentajeBueno >= 50) return 'regular';
  if (porcentajeBueno >= 30) return 'malo';
  return 'muy_malo';
};

module.exports = { calcularCalificacionBase };
