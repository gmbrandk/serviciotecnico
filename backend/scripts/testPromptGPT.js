// scripts/testPromptGPT.js

require('dotenv').config();
const fetchLaptopSpecs = require('@helpers/fetchLaptopSpecs');

(async () => {
  try {
    const input = {
      sku: 'ASUS-TUF-A15-FA506IC', // puedes cambiar esto
      // nombre: 'TUF Gaming A15 FA506IC',
      // numeroSerie: 'XYZ12345678'
    };

    const specs = await fetchLaptopSpecs(input);

    console.log('✅ Especificaciones obtenidas:\n');
    console.log(JSON.stringify(specs, null, 2));
  } catch (err) {
    console.error('❌ Error al probar GPT:\n', err.message);
  }
})();
