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
      cliente,
      representante,
      equipo,
      lineasServicio,
      tecnico,
      total,
      fechaIngreso,
      diagnostico,
      estado,
      tipo,
      observaciones,
    } = data;

    // ─────────────────────────────
    // 1. Resolver cliente
    // ─────────────────────────────
    const clienteFinal = await resolverPersona(cliente, session);
    if (!clienteFinal)
      throw new ValidationError('No se pudo resolver el cliente');

    // ─────────────────────────────
    // 2. Representante
    // ─────────────────────────────

    const representanteFinal =
      (await resolverPersona(representante, session)) || clienteFinal;

    // ─────────────────────────────
    // 3. Equipo
    // ─────────────────────────────
    const equipoFinal = await resolverEquipo(equipo, clienteFinal, session);

    /** ─────────────────────────────
     * 4. Validar líneas de servicio
     * ───────────────────────────── */
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

    /** ─────────────────────────────
     * 5. Crear orden de servicio
     * ───────────────────────────── */
    const ordenServicio = new OrdenServicio({
      cliente: clienteFinal._id,
      representante: representanteFinal._id,
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

    /** ─────────────────────────────
     * 6. Commit de la transacción
     * ───────────────────────────── */
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
