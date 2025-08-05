const OrdenServicio = require('@models/OrdenServicio');
const Cliente = require('@models/Cliente');
require('@models/TipodeTrabajo'); // 👈 Esto registra el modelo en mongoose
const Equipo = require('@models/Equipo');
const { ValidationError } = require('@utils/errors');

const crearOrdenServicioService = async (data) => {
  const {
    cliente,
    representante,
    equipo,
    lineasServicio,
    tecnico,
    total,
    fechaIngreso,
    diagnostico,
    notas,
    estado,
    tipo,
  } = data;

  let clienteFinal = null;
  let equipoFinal = null;

  // Crear o buscar cliente
  if (typeof cliente === 'string') {
    clienteFinal = await Cliente.findById(cliente);
    if (!clienteFinal) throw new ValidationError('Cliente no encontrado');
  } else {
    clienteFinal =
      (await Cliente.findOne({ dni: cliente.dni })) ||
      (await Cliente.findOne({ email: cliente.email })) ||
      (await Cliente.findOne({ telefono: cliente.telefono }));

    if (!clienteFinal) {
      clienteFinal = new Cliente(cliente);
      await clienteFinal.save();
    }
  }

  // Crear o buscar equipo
  if (typeof equipo === 'string') {
    equipoFinal = await Equipo.findById(equipo);
    if (!equipoFinal) throw new ValidationError('Equipo no encontrado');
  } else {
    equipoFinal =
      (await Equipo.findOne({ nroSerie: equipo.nroSerie })) ||
      (await Equipo.findOne({
        marca: equipo.marca,
        modelo: equipo.modelo,
        sku: equipo.sku,
      }));

    if (!equipoFinal) {
      equipoFinal = new Equipo({
        tipo: equipo.tipo,
        marca: equipo.marca,
        modelo: equipo.modelo,
        sku: equipo.sku,
        nroSerie: equipo.nroSerie || equipo.numeroSerie, // 👈 este fix
        clienteActual: clienteFinal._id,
      });
      await equipoFinal.save();
    } else if (
      !equipoFinal.nroSerie &&
      (equipo.nroSerie || equipo.numeroSerie)
    ) {
      equipoFinal.nroSerie = equipo.nroSerie || equipo.numeroSerie;
      await equipoFinal.save();
    }
  }

  const representanteFinal = representante || clienteFinal._id;

  const ordenServicio = new OrdenServicio({
    cliente: clienteFinal._id,
    representante: representanteFinal,
    equipo: equipoFinal._id,
    lineasServicio,
    tecnico,
    total,
    fechaIngreso,
    diagnostico,
    estado,
    tipo,
  });

  await ordenServicio.save();

  // ✅ Poblar todo lo necesario
  await ordenServicio.populate([
    { path: 'cliente' },
    { path: 'representante' },
    { path: 'equipo' },
    { path: 'lineasServicio.tipoTrabajo' },
  ]);

  return ordenServicio;
};

module.exports = crearOrdenServicioService;
