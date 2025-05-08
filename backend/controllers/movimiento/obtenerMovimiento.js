const Movimiento = require('@models/Movimiento');

const obtenerMovimiento = async (req, res) => {
  try {
    const { tipo, entidad, usuarioId, fechaDesde, fechaHasta } = req.query;

    const filtros = {};

    if (tipo) filtros.tipo = tipo;
    if (entidad) filtros.entidad = entidad;
    if (usuarioId) filtros.usuarioId = usuarioId;

    if (fechaDesde || fechaHasta) {
      filtros.fecha = {};
      if (fechaDesde) filtros.fecha.$gte = new Date(fechaDesde);
      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        hasta.setUTCHours(23, 59, 59, 999); // Incluye todo el día hasta las 23:59:59.999
        filtros.fecha.$lte = hasta;
      }
    }

    const historial = await Movimiento.find(filtros)
      .sort({ fecha: -1 }) // más recientes primero
      .populate('realizadoPor', 'nombre') // Cambio de usuarioId a realizadoPor
      .lean();

    const historialFormateado = historial.map(m => ({
      _id: m._id,
      tipo: m.tipo,
      descripcion: m.descripcion,
      entidad: m.entidad,
      entidadId: m.entidadId,
      realizadoPor: m.realizadoPor ? {
        _id: m.realizadoPor._id,
        nombre: m.realizadoPor.nombre
      } : null,
      fecha: m.fecha
    }));

    res.status(200).json({
      success: true,
      historial: historialFormateado
    });

  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener el historial',
      detalles: error.message
    });
  }
};

module.exports = obtenerMovimiento;
