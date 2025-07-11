const FichaTecnica = require('@models/FichaTecnica');

/**
 * Marca una ficha técnica como suspendida temporalmente
 */
const suspenderFichaTecnica = async (req, res) => {
  try {
    const { id } = req.params;
    const ficha = await FichaTecnica.findById(id);

    if (!ficha) {
      return res.status(404).json({ message: 'Ficha técnica no encontrada' });
    }

    if (ficha.estado === 'eliminada') {
      return res
        .status(400)
        .json({ message: 'No se puede suspender una ficha eliminada' });
    }

    if (!ficha.isActiva && ficha.estado === 'suspendida') {
      return res.status(200).json({
        message: 'La ficha ya estaba suspendida',
        ficha,
      });
    }

    ficha.isActiva = false;
    ficha.estado = 'suspendida';
    await ficha.save();

    return res.status(200).json({
      message: 'Ficha suspendida correctamente',
      ficha,
    });
  } catch (err) {
    console.error('[❌ Error en suspenderFichaTecnica]', err);
    return res
      .status(500)
      .json({ message: 'Error al suspender ficha técnica' });
  }
};

/**
 * Reactiva una ficha suspendida
 */
const reactivarFichaTecnica = async (req, res) => {
  try {
    const { id } = req.params;
    const ficha = await FichaTecnica.findById(id);

    if (!ficha) {
      return res.status(404).json({ message: 'Ficha técnica no encontrada' });
    }

    if (ficha.estado === 'eliminada') {
      return res
        .status(400)
        .json({ message: 'No se puede reactivar una ficha eliminada' });
    }

    if (ficha.isActiva && ficha.estado === 'activa') {
      return res.status(200).json({
        message: 'La ficha ya estaba activa',
        ficha,
      });
    }

    ficha.isActiva = true;
    ficha.estado = 'activa';
    await ficha.save();

    return res.status(200).json({
      message: 'Ficha reactivada correctamente',
      ficha,
    });
  } catch (err) {
    console.error('[❌ Error en reactivarFichaTecnica]', err);
    return res
      .status(500)
      .json({ message: 'Error al reactivar ficha técnica' });
  }
};

/**
 * Soft-delete (marca como eliminada)
 */
const eliminarFichaTecnica = async (req, res) => {
  try {
    const { id } = req.params;
    const ficha = await FichaTecnica.findById(id);

    if (!ficha) {
      return res.status(404).json({ message: 'Ficha técnica no encontrada' });
    }

    if (ficha.estado === 'eliminada') {
      return res.status(200).json({
        message: 'La ficha ya estaba eliminada',
        ficha,
      });
    }

    ficha.isActiva = false;
    ficha.estado = 'eliminada';
    await ficha.save();

    return res.status(200).json({
      message: 'Ficha eliminada lógicamente',
      ficha,
    });
  } catch (err) {
    console.error('[❌ Error en eliminarFichaTecnica]', err);
    return res.status(500).json({ message: 'Error al eliminar ficha técnica' });
  }
};

/**
 * Marca una ficha como baneada (baja definitiva)
 */
const confirmarBajaFichaTecnica = async (req, res) => {
  try {
    const { id } = req.params;
    const ficha = await FichaTecnica.findById(id);

    if (!ficha) {
      return res.status(404).json({ message: 'Ficha técnica no encontrada' });
    }

    if (ficha.estado !== 'suspendida') {
      return res.status(400).json({
        message:
          'Solo se puede dar de baja definitiva una ficha que está suspendida',
      });
    }

    ficha.isActiva = false;
    ficha.estado = 'baneada';
    await ficha.save();

    return res.status(200).json({
      message: 'Ficha técnica marcada como baneada',
      ficha,
    });
  } catch (err) {
    console.error('[❌ Error en confirmarBajaFichaTecnica]', err);
    return res
      .status(500)
      .json({ message: 'Error al dar de baja ficha técnica' });
  }
};

module.exports = {
  suspenderFichaTecnica,
  reactivarFichaTecnica,
  eliminarFichaTecnica,
  confirmarBajaFichaTecnica,
};
