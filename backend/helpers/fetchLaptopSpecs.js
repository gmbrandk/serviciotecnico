// fetchLaptopSpecs.js

const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Dado un conjunto de identificadores, intenta obtener las especificaciones técnicas de una laptop.
 * @param {Object} input - Objeto con uno o más identificadores del producto.
 * @param {string} [input.sku] - SKU del producto.
 * @param {string} [input.nombre] - Nombre técnico o comercial.
 * @param {string} [input.numeroSerie] - Número de serie del dispositivo.
 * @returns {Promise<object>} - Especificaciones técnicas en formato JSON.
 */
async function fetchLaptopSpecs({ sku, nombre, numeroSerie }) {
  // Validación básica
  if (![sku, nombre, numeroSerie].some(Boolean)) {
    throw new Error(
      '❌ Debes proporcionar al menos uno de los siguientes campos: sku, nombre, numeroSerie.'
    );
  }

  // Construcción dinámica del prompt
  let prompt = `Necesito que me proporciones las especificaciones técnicas de una laptop con base en los siguientes datos. 
Devuélveme esta información en formato JSON con los siguientes campos:
- Marca
- Modelo
- CPU
- GPU
- RAM
- Almacenamiento

Si algún dato no está claro, déjalo como null. No inventes información.`;

  if (sku) {
    prompt += `\n\nSKU: ${sku}`;
  }
  if (nombre) {
    prompt += `\nNombre técnico: ${nombre}`;
  }
  if (numeroSerie) {
    prompt += `\nNúmero de serie: ${numeroSerie}`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const respuesta = completion.choices[0].message.content;

    try {
      const parsed = JSON.parse(respuesta);

      // Validación estructural opcional
      const camposEsperados = [
        'Marca',
        'Modelo',
        'CPU',
        'GPU',
        'RAM',
        'Almacenamiento',
      ];
      for (const campo of camposEsperados) {
        if (!(campo in parsed)) {
          console.warn(`⚠️ Campo faltante en respuesta GPT: "${campo}"`);
        }
      }

      return parsed;
    } catch (err) {
      throw new Error(
        `❌ La respuesta de GPT no es JSON válido:\n${respuesta}`
      );
    }
  } catch (err) {
    console.error('💥 Error al recuperar especificaciones:', err.message);
    throw err;
  }
}

module.exports = fetchLaptopSpecs;
