/**
 * 🧠 Calcula calificación base del cliente según sus órdenes.
 * Función pura: sin efectos secundarios.
 */
const calcularCalificacionBase = (ordenes) => {
  // ✅ Positivas
  const buenas = ordenes.filter((os) => os.estadoEquipo === 'reparado').length;

  // ❌ Negativas por decisión del cliente
  const malas = ordenes.filter(
    (os) => os.estadoEquipo === 'retiro_cliente'
  ).length;

  // ⚖️ Ignoramos 'irreparable' para no penalizar indebidamente
  const total = buenas + malas;

  if (total === 0) return 'regular'; // Sin data relevante para calificar

  const porcentajeBueno = (buenas / total) * 100;

  if (porcentajeBueno >= 90 && total >= 5) return 'muy_bueno';
  if (porcentajeBueno >= 70) return 'bueno';
  if (porcentajeBueno >= 50) return 'regular';
  if (porcentajeBueno >= 30) return 'malo';
  return 'muy_malo';
};

module.exports = { calcularCalificacionBase };
