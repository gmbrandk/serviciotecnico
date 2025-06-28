require('module-alias/register'); // 👈 Esto habilita los aliases

const obtenerCodigosTelefonicos = require('@utils/telefonia/obtenerCodigosTelefonicos');

(async () => {
  const codigos = await obtenerCodigosTelefonicos();
  console.table(codigos.slice(0, 10)); // Solo los 10 primeros
})();
