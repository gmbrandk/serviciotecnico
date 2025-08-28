// services/ordenServicio/crearOrdenServicioService.js
const OrdenServicio = require('@models/OrdenServicio');
const Cliente = require('@models/Cliente');
const Equipo = require('@models/Equipo');
const { ValidationError } = require('@utils/errors');
const TipoTrabajo = require('@models/TipodeTrabajo');
const mongoose = require('mongoose');

const crearClienteService = require('@services/clientes/crearClienteService');
const obtenerClientesService = require('@services/clientes/obtenerClientesService');
const crearEquipoService = require('@services/equipos/crearEquipoService');

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

    /** ─────────────────────────────
     * 1. Resolver cliente
     * ───────────────────────────── */
    let clienteFinal;
    if (typeof cliente === 'string') {
      clienteFinal = await obtenerClientesService({ id: cliente });
    } else {
      let existente = null;

      if (cliente.dni) {
        existente = await Cliente.findOne({ dni: cliente.dni }).session(
          session
        );
      }
      if (!existente && cliente.email) {
        existente = await Cliente.findOne({ email: cliente.email }).session(
          session
        );
      }
      if (!existente && cliente.telefono) {
        existente = await Cliente.findOne({
          telefono: cliente.telefono,
        }).session(session);
      }

      if (existente) {
        clienteFinal = existente;
      } else {
        clienteFinal = await crearClienteService(cliente, { session });
      }
    }
    if (!clienteFinal)
      throw new ValidationError('No se pudo resolver el cliente');

    /** ─────────────────────────────
     * 2. Representante
     * ───────────────────────────── */
    let representanteFinal;
    if (representante) {
      if (typeof representante === 'string') {
        representanteFinal = await obtenerClientesService({
          id: representante,
        });
      } else {
        representanteFinal =
          (await Cliente.findOne({ dni: representante.dni }).session(
            session
          )) || (await crearClienteService(representante, { session }));
      }
    } else {
      representanteFinal = clienteFinal;
    }

    /** ─────────────────────────────
     * 3. Equipo
     * ───────────────────────────── */
    let equipoFinal;
    if (typeof equipo === 'string') {
      equipoFinal = await Equipo.findById(equipo).session(session);
      if (!equipoFinal) throw new ValidationError('Equipo no encontrado');
    } else {
      const normalizarSerie = (str = '') =>
        str
          .toUpperCase()
          .replace(/O/g, '0')
          .replace(/I/g, '1')
          .replace(/L/g, '1')
          .replace(/S/g, '5');

      let existente = null;
      if (equipo.nroSerie) {
        const posibles = await Equipo.find({
          nroSerie: { $exists: true },
        }).session(session);
        existente = posibles.find(
          (eq) =>
            normalizarSerie(eq.nroSerie) === normalizarSerie(equipo.nroSerie)
        );
      }

      if (!existente) {
        existente = await Equipo.findOne({
          $or: [
            equipo.imei ? { imei: equipo.imei } : null,
            equipo.macAddress ? { macAddress: equipo.macAddress } : null,
          ].filter(Boolean),
        }).session(session);
      }

      equipoFinal =
        existente ||
        (await crearEquipoService(
          { ...equipo, clienteActual: clienteFinal._id },
          session
        ));
    }

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
      { path: 'equipo' },
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
