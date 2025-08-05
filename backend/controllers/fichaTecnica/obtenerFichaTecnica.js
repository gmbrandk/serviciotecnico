const FichaTecnica = require('@models/FichaTecnica');
const generarTokensBusqueda = require('@utils/generadores/tokens');
const { sendError, sendSuccess } = require('@utils/httpResponse');

const obtenerFichaTecnica = async (req, res) => {
  try {
    const { busqueda = '', raw = false } = req.query;
    const filtros = [];

    if (busqueda.trim()) {
      const regex = new RegExp(busqueda.trim(), 'i');

      if (raw === 'true') {
        // 🔍 Búsqueda flexible en múltiples campos
        filtros.push({
          $or: [
            { modelo: regex },
            { cpu: regex },
            { gpu: regex },
            { ram: regex },
            { almacenamiento: regex },
            { sistemaOperativo: regex },
            { pantalla: regex },
            { puertos: regex },
            { conectividad: regex },
            { bateria: regex },
            { dimensiones: regex },
            { peso: regex },
          ],
        });
      } else {
        // Búsqueda por tokens
        const tokens = generarTokensBusqueda(busqueda);
        filtros.push({ tokensBusqueda: { $all: tokens } });
      }
    }

    const fichas = await FichaTecnica.find(
      filtros.length ? { $and: filtros } : {}
    ).sort({ modelo: 1 });

    if (!fichas.length) {
      return sendError(res, 404, 'No se encontraron coincidencias');
    }

    return sendSuccess(res, {
      message: 'Fichas Tecnicas obtenidos correctamente',
      details: fichas,
    });
  } catch (error) {
    sendError(res, 500, 'Error al buscar fichas técnicas');
  }
};

module.exports = obtenerFichaTecnica;
