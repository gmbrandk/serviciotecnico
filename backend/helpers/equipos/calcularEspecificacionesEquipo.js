// 📁 helpers/equipos/calcularEspecificacionesEquipo.js
const normalizeSpec = require('@utils/normalizeSpec');

const camposTecnicos = ['ram', 'almacenamiento', 'cpu', 'gpu'];

const calcularEspecificacionesEquipo = (fichaBase = {}, sobrescritos = {}) => {
  const resultado = {};
  let repotenciado = false;

  console.log('\n🧪 [Helper] --- Inicio cálculo especificaciones ---');

  camposTecnicos.forEach((campo) => {
    const manual = sobrescritos[campo];
    const base = fichaBase?.[campo];

    console.log(`📌 Campo: ${campo}`);
    console.log(`   - Base:   ${base}`);
    console.log(`   - Manual: ${manual}`);

    if (manual !== undefined) {
      if (base !== undefined) {
        const normBase = normalizeSpec(base);
        const normManual = normalizeSpec(manual);

        console.log(`   - Normalizado Base:   ${normBase}`);
        console.log(`   - Normalizado Manual: ${normManual}`);

        // 🔍 Mostrar tokens antes de unirlos (debug extra)
        if (normBase || normManual) {
          console.log(
            `   - Tokens Base:   [${normBase?.match(/[A-Z]+|\d+/g)}]`
          );
          console.log(
            `   - Tokens Manual: [${normManual?.match(/[A-Z]+|\d+/g)}]`
          );
        }

        if (normBase && normManual && normBase !== normManual) {
          console.warn(
            `⚠️ Diferencia detectada en "${campo}" → se marca como repotenciado`
          );
          repotenciado = true;
        }
      }

      resultado[campo] = { valor: manual, fuente: 'manual' };
    } else if (base !== undefined) {
      resultado[campo] = { valor: base, fuente: 'template' };
    }
  });

  console.log('🧪 [Helper] Resultado:', resultado);
  console.log('🧪 [Helper] ¿Repotenciado?:', repotenciado);

  return { especificacionesActuales: resultado, repotenciado };
};

module.exports = calcularEspecificacionesEquipo;
