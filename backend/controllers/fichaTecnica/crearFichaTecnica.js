const FichaTecnica = require('@models/FichaTecnica');
const generarNombreTecnico = require('@utils/formatters/normalizarNombreTecnico');
const generarTokensBusqueda = require('@utils/generadores/tokens');
const { ValidationError, DuplicateError } = require('@utils/errors');

const crearFichaTecnica = async (req, res) => {
  try {
    const { modelo, sku, marca, cpu, gpu, ram, almacenamiento, fuente } =
      req.body;

    if (!modelo || !sku || !marca) {
      throw new ValidationError('Modelo, SKU y marca son requeridos');
    }

    // 🔧 Normalizamos el modelo y lo usamos como identificador principal
    const modeloNormalizado = generarNombreTecnico(marca, modelo);
    if (!modeloNormalizado) {
      throw new ValidationError('Modelo o marca inválidos');
    }

    // 🔍 Validar duplicados usando modelo y SKU (ambos normalizados)
    const yaExiste = await FichaTecnica.findOne({
      modelo: new RegExp(`^${modeloNormalizado}$`, 'i'),
      sku: new RegExp(`^${sku}$`, 'i'),
    });

    if (yaExiste) {
      throw new DuplicateError('Ficha técnica ya existe con ese modelo y SKU');
    }

    // 🧠 Generar tokens de búsqueda desde modelo normalizado + marca + SKU
    const tokensBusqueda = generarTokensBusqueda(
      `${modeloNormalizado} ${sku} ${marca}`
    );

    // 💾 Crear nueva ficha técnica
    const ficha = new FichaTecnica({
      modelo: modeloNormalizado, // reemplazamos modelo por versión normalizada
      sku,
      marca,
      cpu,
      gpu,
      ram,
      almacenamiento,
      fuente: fuente || 'manual',
      tokensBusqueda,
    });

    await ficha.save();
    return res.status(201).json({ ficha });
  } catch (err) {
    console.error('[❌ Error en crearFichaTecnica]:', err);

    if (err.status) {
      return res.status(err.status).json({
        success: false,
        message: err.message,
        details: err.details || null,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno al crear ficha técnica',
    });
  }
};

module.exports = crearFichaTecnica;
