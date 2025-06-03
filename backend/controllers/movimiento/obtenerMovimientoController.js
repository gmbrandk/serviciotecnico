const Movimiento = require('@models/Movimiento');
const generarDescripcion = require('@utils/movimientos/generarDescripcionMovimiento');
const { isValidObjectId } = require('mongoose');

const obtenerMovimientoController = async (req, res) => {
  try {
    const { entidad, tipo, usuarioId, desde, hasta, texto } = req.query;

    const filtro = {};

    if (entidad) filtro.entidad = entidad;
    if (tipo) filtro.tipo = tipo;
    if (usuarioId && isValidObjectId(usuarioId)) {
      filtro.realizadoPor = usuarioId;
    }

    if (desde || hasta) {
      filtro.fecha = {};
      if (desde) filtro.fecha.$gte = new Date(desde);
      if (hasta) filtro.fecha.$lte = new Date(hasta);
    }

    let movimientos = await Movimiento.find(filtro)
      .populate('realizadoPor', 'nombre')
      .populate('usadoPor', 'nombre')
      .sort({ fecha: -1 });

    // Generar descripción para aplicar filtro por texto si se desea
    const historial = movimientos.map((mov) => ({
      _id: mov._id,
      tipo: mov.tipo,
      entidad: mov.entidad,
      entidadId: mov.entidadId,
      realizadoPor: mov.realizadoPor,
      usadoPor: mov.usadoPor,
      fecha: mov.fecha,
      descripcion: generarDescripcion(mov),
    }));

    const historialFiltrado = texto
      ? historial.filter((mov) =>
          mov.descripcion.toLowerCase().includes(texto.toLowerCase())
        )
      : historial;

    res.json({ success: true, historial: historialFiltrado });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res
      .status(500)
      .json({ success: false, mensaje: 'Error al obtener historial' });
  }
};

module.exports = obtenerMovimientoController;
