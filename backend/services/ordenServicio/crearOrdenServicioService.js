const OrdenServicio = require('@models/OrdenServicio');
const Cliente = require('@models/Cliente');
const { Equipo } = require('@models/Equipo');
const TipoTrabajo = require('@models/TipodeTrabajo');
const { ValidationError } = require('@utils/errors');
const mongoose = require('mongoose');

const crearOrdenServicioService = async (data) => {
  console.log('▶️ Iniciando creación de Orden de Servicio...');

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      representanteId,
      equipoId,
      lineasServicio,
      tecnico,
      total,
      fechaIngreso,
      diagnosticoCliente,
      estado,
      tipo,
      observaciones,
    } = data;

    // 1. Validar equipo y cliente
    const equipoFinal = await Equipo.findById(equipoId).session(session);
    if (!equipoFinal) throw new ValidationError('Equipo no válido');
    if (!equipoFinal.clienteActual) {
      throw new ValidationError('El equipo no tiene un clienteActual asignado');
    }

    const clienteFinal = await Cliente.findById(
      equipoFinal.clienteActual
    ).session(session);
    if (!clienteFinal) {
      throw new ValidationError(
        `El equipo con nroSerie ${equipoFinal.nroSerie} tiene un clienteActual inválido.`
      );
    }

    // 2. Representante: si no se envía, usar cliente
    const representanteDef = representanteId || clienteFinal._id;

    // 3. Validar líneas de servicio
    if (!Array.isArray(lineasServicio) || lineasServicio.length === 0) {
      throw new ValidationError('Se requiere al menos una línea de servicio.');
    }

    const lineasServicioFinal = await Promise.all(
      lineasServicio.map(async (linea, index) => {
        const tipoTrabajo = await TipoTrabajo.findById(
          linea.tipoTrabajo
        ).session(session);
        if (!tipoTrabajo) {
          throw new ValidationError(
            `El tipoTrabajo en la línea ${index + 1} no existe.`
          );
        }

        return {
          tipoTrabajo: tipoTrabajo._id,
          descripcion: linea.descripcion || '',
          cantidad: linea.cantidad,
          precioUnitario: linea.precioUnitario,
        };
      })
    );

    const totalCalculado = lineasServicioFinal.reduce(
      (sum, l) => sum + l.precioUnitario * l.cantidad,
      0
    );

    // 4. Crear la Orden
    const ordenServicio = new OrdenServicio({
      cliente: clienteFinal._id,
      representante: representanteDef,
      equipo: equipoFinal._id,
      lineasServicio: lineasServicioFinal,
      tecnico,
      total: total || totalCalculado,
      fechaIngreso: fechaIngreso || new Date(),
      diagnosticoCliente,
      estadoOS: estado || 'pendiente',
      tipo,
      observaciones,
    });

    await ordenServicio.save({ session });

    // 5. Populate enriquecido
    await ordenServicio.populate([
      { path: 'cliente', select: 'nombres apellidos dni telefono email' },
      { path: 'representante', select: 'nombres apellidos dni telefono email' },
      { path: 'tecnico', select: 'nombre email' },
      {
        path: 'equipo',
        select:
          'tipo marca modelo sku nroSerie macAddress imei estadoIdentificacion',
      },
      {
        path: 'lineasServicio.tipoTrabajo',
        select: 'nombre descripcion precioBase',
      },
    ]);

    await session.commitTransaction();
    session.endSession();

    console.log('✅ Orden de Servicio creada con éxito.');
    return ordenServicio;
  } catch (error) {
    console.error('❌ Error en crearOrdenServicioService:', error);
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = crearOrdenServicioService;
