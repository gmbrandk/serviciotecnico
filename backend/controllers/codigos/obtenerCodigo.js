const CodigoAcceso = require('@models/CodigoAcceso');
const Movimiento = require('@models/Movimiento');
const { logError } = require('@utils/logger');

const obtenerCodigos = async (req, res) => {
  try {
    const codigos = await CodigoAcceso.find().sort({ fechaCreacion: -1 });

    const codigosConCreador = await Promise.all(
      codigos.map(async (codigo) => {
        const movimiento = await Movimiento.findOne({
          tipo: 'crear',
          entidad: 'CodigoAcceso',
          entidadId: codigo._id
        }).populate('realizadoPor', 'nombre');

        return {
          id: codigo._id,
          codigo: codigo.codigo,
          estado: codigo.estado,
          usosDisponibles: codigo.usosDisponibles,
          fechaCreacion: codigo.fechaCreacion,
          creadoPor: movimiento?.realizadoPor
            ? {
                id: movimiento.realizadoPor._id,
                nombre: movimiento.realizadoPor.nombre
              }
            : null
        };
      })
    );

    res.json({ success: true, codigos: codigosConCreador });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener los códigos de acceso'
    });
  }
};

module.exports = obtenerCodigos;
