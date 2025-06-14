/**
 * 🧠 Calcula calificación base del cliente según sus órdenes.
 * Función pura: sin efectos secundarios.
 */
const calcularCalificacionBase = (ordenes) => {
  const buenas = ordenes.filter((os) => os.estadoEquipo === 'reparado').length;
  const malas = ordenes.filter(
    (os) => os.estadoEquipo === 'retiro_cliente'
  ).length;

  const total = buenas + malas;

  if (total < 3) return 'regular'; // Muy poca data para emitir un juicio extremo

  const porcentajeBueno = (buenas / total) * 100;

  if (porcentajeBueno >= 90 && total >= 5) return 'muy_bueno';
  if (porcentajeBueno >= 70) return 'bueno';
  if (porcentajeBueno >= 50) return 'regular';
  if (porcentajeBueno >= 30 && total >= 5) return 'malo';
  if (porcentajeBueno < 30 && total >= 5) return 'muy_malo';

  return 'regular';
};

module.exports = { calcularCalificacionBase };
