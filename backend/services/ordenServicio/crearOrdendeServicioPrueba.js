// services/ordenServicio/crearOrdenServicioService.js
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
      clienteId,
      representanteId,
      equipoId,
      lineasServicio,
      tecnico,
      total,
      fechaIngreso,
      diagnostico,
      estado,
      tipo,
      observaciones,
    } = data;

    // 1. Validar cliente
    const clienteFinal = await Cliente.findById(clienteId).session(session);
    if (!clienteFinal) throw new ValidationError('Cliente no válido');

    // 2. Validar equipo
    const equipoFinal = await Equipo.findById(equipoId).session(session);
    if (!equipoFinal) throw new ValidationError('Equipo no válido');
    if (!equipoFinal.clienteActual) {
      throw new ValidationError(
        'El equipo debe tener un clienteActual asignado'
      );
    }

    // 3. Validar representante (opcional)
    const representanteDef = representanteId || clienteFinal._id;

    // 4. Validar líneas de servicio
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
          nombreTrabajo: linea.nombreTrabajo,
          descripcionTrabajo: linea.descripcion || '',
          precioUnitario: linea.precioUnitario,
          cantidad: linea.cantidad,
        };
      })
    );

    const totalCalculado = lineasServicioFinal.reduce(
      (sum, linea) => sum + linea.precioUnitario * linea.cantidad,
      0
    );

    // 5. Crear orden
    const ordenServicio = new OrdenServicio({
      cliente: clienteFinal._id,
      representante: representanteDef,
      equipo: equipoFinal._id,
      lineasServicio: lineasServicioFinal,
      tecnico,
      total: total || totalCalculado,
      fechaIngreso: fechaIngreso || new Date(),
      diagnostico,
      estadoOS: estado || 'pendiente',
      tipo,
      observaciones,
    });

    await ordenServicio.save({ session });

    await ordenServicio.populate([
      { path: 'cliente' },
      { path: 'representante' },
      {
        path: 'equipo',
        select:
          'tipo marca modelo sku nroSerie macAddress imei estadoIdentificacion',
      },
      { path: 'lineasServicio.tipoTrabajo' },
    ]);

    await session.commitTransaction();
    session.endSession();

    return ordenServicio;
  } catch (error) {
    console.error('❌ Error en crearOrdenServicioService:', error);
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = crearOrdenServicioService;
