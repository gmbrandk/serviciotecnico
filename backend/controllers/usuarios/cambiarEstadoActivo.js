const TIPOS_MOVIMIENTO = require('../../utils/constantes/tiposMovimiento');
const { crearMovimiento } = require('@controllers/movimientoController');

const cambiarEstadoActivo = async (req, res) => {
  try {
    const usuario = req.usuarioObjetivo; // Ya viene del middleware
    const usuarioSolicitante = req.usuario; // Usuario autenticado
    const { activo } = req.body;

    if (typeof activo !== 'boolean') {
      return res.status(400).json({
        success: false,
        mensaje: 'El campo "activo" debe ser booleano (true o false).',
      });
    }

    if (usuario.activo === activo) {
      return res.status(200).json({
        success: true,
        mensaje: `El usuario ya se encuentra ${
          activo ? 'activo' : 'inactivo'
        }.`,
      });
    }

    usuario.activo = activo;
    await usuario.save();

    const tipo = activo
      ? TIPOS_MOVIMIENTO.REACTIVAR
      : TIPOS_MOVIMIENTO.DESACTIVAR;

    await crearMovimiento({
      tipo,
      descripcion: `El usuario ${usuarioSolicitante.nombre} ${
        activo ? 'reactivó' : 'desactivó'
      } al usuario ${usuario.nombre} correctamente.`,
      entidad: 'Usuario',
      entidadId: usuario._id,
      usuarioId: usuarioSolicitante._id,
      fecha: new Date(),
    });

    res.json({
      success: true,
      mensaje: `Usuario ${
        activo ? 'reactivado' : 'desactivado'
      } correctamente.`,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        activo: usuario.activo,
      },
    });
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error del servidor al actualizar estado del usuario.',
    });
  }
};

module.exports = cambiarEstadoActivo;
