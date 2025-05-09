const Movimiento = require('@models/Movimiento');
const generarDescripcion = require('@utils/movimientos/generarDescripcionMovimiento');

const obtenerMovimiento = async (req, res) => {
  try {
    const { entidad } = req.query;
    const filtro = entidad ? { entidad } : {};

    const movimientos = await Movimiento.find(filtro)
      .populate('realizadoPor', 'nombre')
      .populate('usadoPor', 'nombre') // Si quieres incluir al usuario que usó el código
      .sort({ fecha: -1 });

    const historial = movimientos.map(mov => ({
      _id: mov._id,
      tipo: mov.tipo,
      entidad: mov.entidad,
      entidadId: mov.entidadId,
      realizadoPor: mov.realizadoPor,
      usadoPor: mov.usadoPor,
      fecha: mov.fecha,
      descripcion: generarDescripcion(mov)
    }));

    res.json({ success: true, historial });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ success: false, mensaje: 'Error al obtener historial' });
  }
};


module.exports = obtenerMovimiento;
