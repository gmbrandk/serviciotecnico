const Movimiento = require('@models/Movimiento');
const generarDescripcion = require('@utils/movimientos/generarDescripcionMovimiento');
const { isValidObjectId } = require('mongoose');

const obtenerMovimientoService = async ({
  entidad,
  tipo,
  usuarioId,
  desde,
  hasta,
  texto,
}) => {
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

  const movimientos = await Movimiento.find(filtro)
    .populate('realizadoPor', 'nombre')
    .populate('usadoPor', 'nombre')
    .sort({ fecha: -1 });

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

  return historialFiltrado;
};

module.exports = obtenerMovimientoService;
