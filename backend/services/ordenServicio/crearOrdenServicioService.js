// services/ordenServicio/crearOrdenServicioService.js
const OrdenServicio = require('@models/OrdenServicio');
const Cliente = require('@models/Cliente');
const { Equipo } = require('@models/Equipo');
const { ValidationError } = require('@utils/errors');
const TipoTrabajo = require('@models/TipodeTrabajo');
const mongoose = require('mongoose');

const resolverPersona = require('@helpers/resolverPersona');
const resolverEquipo = require('@helpers/resolverEquipo');

const crearOrdenServicioService = async (data) => {
  console.log('▶️ Iniciando creación de Orden de Servicio...');

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      representante, // persona que viene al taller
      equipo, // equipo en cuestión
      lineasServicio,
      tecnico,
      total,
      fechaIngreso,
      diagnostico,
      estado,
      tipo,
      observaciones,
    } = data;

    // 1. Resolver representante (puede ser null)
    const representanteFinal =
      (await resolverPersona(representante, session)) || null;

    // 2. Resolver equipo (puede existir o ser nuevo)
    const equipoFinal = await resolverEquipo(equipo, null, session);

    // 3. Resolver cliente según equipo.clienteActual o fallback a data.cliente
    let clienteFinal;
    if (equipoFinal.clienteActual) {
      clienteFinal = await Cliente.findById(equipoFinal.clienteActual).session(
        session
      );
      if (!clienteFinal) {
        throw new ValidationError(
          `El equipo con nroSerie ${equipoFinal.nroSerie} tiene un clienteActual inválido.`
        );
      }
    } else {
      if (!data.cliente) {
        throw new ValidationError(
          'El equipo no tiene clienteActual y no se proporcionó cliente en la petición.'
        );
      }
      clienteFinal = await resolverPersona(data.cliente, session);
      equipoFinal.clienteActual = clienteFinal._id;
      equipoFinal.historialPropietarios.push({
        clienteId: clienteFinal._id,
        fechaAsignacion: new Date(),
      });
      await equipoFinal.save({ session });
    }

    // 4. Si no hay representante explícito, usamos cliente
    const representanteDef = representanteFinal || clienteFinal;

    // 5. Validar líneas de servicio
    if (!Array.isArray(lineasServicio) || lineasServicio.length === 0) {
      throw new ValidationError('Se requiere al menos una línea de servicio.');
    }

    const lineasServicioFinal = await Promise.all(
      lineasServicio.map(async (linea, index) => {
        if (!mongoose.Types.ObjectId.isValid(linea.tipoTrabajo)) {
          throw new ValidationError(
            `El tipoTrabajo en la línea ${index + 1} no es un ObjectId válido.`
          );
        }
        const tipoTrabajo = await TipoTrabajo.findById(
          linea.tipoTrabajo
        ).session(session);
        if (!tipoTrabajo) {
          throw new ValidationError(
            `El tipoTrabajo en la línea ${index + 1} no existe.`
          );
        }
        if (
          typeof linea.precioUnitario !== 'number' ||
          typeof linea.cantidad !== 'number'
        ) {
          throw new ValidationError(
            `La línea ${
              index + 1
            } debe tener precioUnitario y cantidad numéricos.`
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

    // 6. Crear orden de servicio
    const ordenServicio = new OrdenServicio({
      cliente: clienteFinal._id,
      representante: representanteDef._id,
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

    // 7. Commit de la transacción
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
