const FichaTecnica = require('@models/FichaTecnica');
const generarNombreTecnico = require('@utils/formatters/normalizarNombreTecnico');
const generarTokensBusqueda = require('@utils/generadores/tokens');
const { ValidationError, DuplicateError } = require('@utils/errors');

const crearFichaTecnica = async (req, res) => {
  try {
    const { modelo, sku, marca, cpu, gpu, ram, almacenamiento, fuente } = req.body;

    // 🔍 Validaciones unitarias por campo obligatorio
    if (!modelo) throw new ValidationError('El campo "modelo" es obligatorio');
    if (!sku) throw new ValidationError('El campo "sku" es obligatorio');
    if (!marca) throw new ValidationError('El campo "marca" es obligatorio');
    if (!cpu) throw new ValidationError('El campo "cpu" es obligatorio');
    if (!gpu) throw new ValidationError('El campo "gpu" es obligatorio');
    if (!ram) throw new ValidationError('El campo "ram" es obligatorio');
    if (!almacenamiento) throw new ValidationError('El campo "almacenamiento" es obligatorio');

    // 🔧 Normalización
    const modeloNormalizado = generarNombreTecnico(marca, modelo);
    if (!modeloNormalizado) {
      throw new ValidationError('Modelo o marca inválidos para generar modelo normalizado');
    }

    // 🔍 Validar duplicado exacto por modelo normalizado
    const yaExisteModelo = await FichaTecnica.findOne({ modelo: modeloNormalizado });
    if (yaExisteModelo) {
      throw new DuplicateError(`Ya existe una ficha técnica con el modelo "${modeloNormalizado}"`);
    }

    // 🔍 Validar duplicado exacto por SKU
    const yaExisteSku = await FichaTecnica.findOne({ sku: new RegExp(`^${sku}$`, 'i') });
    if (yaExisteSku) {
      throw new DuplicateError(`Ya existe una ficha técnica con el SKU "${sku}"`);
    }

    // 🧠 Generar tokens de búsqueda para match inteligente
    const tokensBusqueda = generarTokensBusqueda(`${modeloNormalizado} ${sku} ${marca}`);

    // 💾 Crear ficha
    const ficha = new FichaTecnica({
      modelo: modeloNormalizado,
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
