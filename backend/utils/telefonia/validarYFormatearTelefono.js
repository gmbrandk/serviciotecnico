// 📁 utils/telefonia/validarYFormatearTelefono.js
const prefijosTelefonicos = require('./prefijosTelefonicos.json'); // Datos unificados con longitudEsperada incluida

/**
 * Valida y formatea un número telefónico según prefijos internacionales.
 * @param {string} numeroEntrada - Teléfono ingresado por el usuario.
 * @returns {Object} Objeto con información del número o error lanzado.
 */
function validarYFormatearTelefono(numeroEntrada) {
  const entrada = numeroEntrada.replace(/\s|-/g, ''); // limpiar espacios y guiones

  // Si empieza con +, buscar prefijo internacional
  if (entrada.startsWith('+')) {
    const entradaSinMas = entrada.slice(1);

    // Buscar coincidencias de prefijo (prefijo más largo primero)
    const coincidencias = prefijosTelefonicos.filter(({ codigo }) =>
      entrada.startsWith(codigo)
    );

    if (coincidencias.length === 0) {
      throw new Error('Prefijo internacional no reconocido');
    }

    // Tomar el prefijo más largo coincidente
    const paisDetectado = coincidencias.sort(
      (a, b) => b.codigo.length - a.codigo.length
    )[0];

    const { codigo, longitudEsperada } = paisDetectado;
    const numeroSinPrefijo = entrada.slice(codigo.length);

    if (longitudEsperada && numeroSinPrefijo.length !== longitudEsperada) {
      throw new Error(
        `El número debe tener ${longitudEsperada} dígitos para ${paisDetectado.pais}`
      );
    }

    return {
      telefonoFormateado: `${codigo}${numeroSinPrefijo}`,
      prefijo: codigo,
      numeroLocal: numeroSinPrefijo,
      pais: paisDetectado.pais,
      iso: paisDetectado.iso,
      bandera: paisDetectado.bandera,
    };
  } else {
    // Asumimos Perú +51 si no se incluye código
    const codigo = '+51';
    const numeroLocal = entrada;

    // Buscar metadata de Perú
    const peru = prefijosTelefonicos.find((p) => p.codigo === codigo);
    const longitudEsperada = peru?.longitudEsperada || 9;

    if (numeroLocal.length !== longitudEsperada) {
      throw new Error(
        `El número debe tener ${longitudEsperada} dígitos para Perú`
      );
    }

    return {
      telefonoFormateado: `${codigo}${numeroLocal}`,
      prefijo: codigo,
      numeroLocal,
      pais: peru?.pais || 'Perú',
      iso: peru?.iso || 'PE',
      bandera: peru?.bandera || 'https://flagcdn.com/pe.svg',
    };
  }
}

module.exports = validarYFormatearTelefono;
