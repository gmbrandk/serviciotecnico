const FichaTecnica = require('@models/FichaTecnica');
const generarNombreTecnico = require('@utils/formatters/normalizarNombreTecnico');
const generarTokensBusqueda = require('@utils/generadores/tokens');
const { ValidationError, DuplicateError } = require('@utils/errors');

const editarFichaTecnica = async (req, res) => {
  try {
    const { id } = req.params;
    const { modelo, sku, marca, cpu, gpu, ram, almacenamiento, fuente } = req.body;

    if (!modelo) throw new ValidationError('El campo "modelo" es obligatorio');
    if (!sku) throw new ValidationError('El campo "sku" es obligatorio');
    if (!marca) throw new ValidationError('El campo "marca" es obligatorio');
    if (!cpu) throw new ValidationError('El campo "cpu" es obligatorio');
    if (!gpu) throw new ValidationError('El campo "gpu" es obligatorio');
    if (!ram) throw new ValidationError('El campo "ram" es obligatorio');
    if (!almacenamiento) throw new ValidationError('El campo "almacenamiento" es obligatorio');

    const modeloNormalizado = generarNombreTecnico(marca, modelo);
    if (!modeloNormalizado) {
      throw new ValidationError('Modelo o marca inválidos para generar modelo normalizado');
    }

    // Verificar que no haya otra ficha con ese modelo o SKU
    const conflicto = await FichaTecnica.findOne({
      _id: { $ne: id },
      $or: [
        { modelo: modeloNormalizado },
        { sku: new RegExp(`^${sku}$`, 'i') },
      ],
    });

    if (conflicto) {
      throw new DuplicateError('Ya existe otra ficha técnica con ese modelo o SKU');
    }

    const tokensBusqueda = generarTokensBusqueda(`${modeloNormalizado} ${sku} ${marca}`);

    const actualizada = await FichaTecnica.findByIdAndUpdate(
      id,
      {
        modelo: modeloNormalizado,
        sku,
        marca,
        cpu,
        gpu,
        ram,
        almacenamiento,
        fuente: fuente || 'manual',
        tokensBusqueda,
      },
      { new: true }
    );

    if (!actualizada) {
      return res.status(404).json({ message: 'Ficha técnica no encontrada' });
    }

    return res.json({ ficha: actualizada });

  } catch (err) {
    console.error('[❌ Error en editarFichaTecnica]:', err);

    if (err.status) {
      return res.status(err.status).json({
        success: false,
        message: err.message,
        details: err.details || null,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno al editar ficha técnica',
    });
  }
};

module.exports = editarFichaTecnica;
