// services/ordenServicio/crearOrdenServicioService.js
const OrdenServicio = require('@models/OrdenServicio');
const Cliente = require('@models/Cliente');
const Equipo = require('@models/Equipo');
const { ValidationError } = require('@utils/errors');
const mongoose = require('mongoose');

const crearClienteService = require('@services/clientes/crearClienteService');
const obtenerClientesService = require('@services/clientes/obtenerClientesService');
const crearEquipoService = require('@services/equipos/crearEquipoService');

const crearOrdenServicioService = async (data) => {
  console.log('▶️ Iniciando creación de Orden de Servicio...');

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

  // 1. Resolver cliente
  let clienteFinal;
  if (typeof cliente === 'string') {
    console.log('🔎 Buscando cliente por ID:', cliente);
    clienteFinal = await obtenerClientesService({ id: cliente });
  } else {
    console.log('🔎 Buscando cliente con datos:', cliente);

    let existente = null;

    if (cliente.dni) {
      existente = await Cliente.findOne({ dni: cliente.dni }).exec();
      if (existente)
        console.log('✅ Cliente encontrado por DNI:', existente._id);
    }

    if (!existente && cliente.email && cliente.email.trim() !== '') {
      existente = await Cliente.findOne({ email: cliente.email }).exec();
      if (existente)
        console.log('✅ Cliente encontrado por email:', existente._id);
    }

    if (!existente && cliente.telefono) {
      existente = await Cliente.findOne({ telefono: cliente.telefono }).exec();
      if (existente)
        console.log('✅ Cliente encontrado por teléfono:', existente._id);
    }

    if (existente) {
      clienteFinal = existente;
    } else {
      console.log('🆕 No se encontró cliente, creando...');
      clienteFinal = await crearClienteService(cliente);
      console.log('✅ Cliente creado:', clienteFinal._id);
    }
  }

  if (!clienteFinal) {
    throw new ValidationError('No se pudo resolver el cliente');
  }

  console.log('📌 Cliente final listo:', clienteFinal._id);

  // 2. Representante (opcional)
  let representanteFinal = null;
  if (representante) {
    if (typeof representante === 'string') {
      representanteFinal = await obtenerClientesService({ id: representante });
    } else {
      representanteFinal =
        (await Cliente.findOne({ dni: representante.dni }).exec()) ||
        (await crearClienteService(representante));
    }
  } else {
    representanteFinal = clienteFinal;
  }
  console.log('📌 Representante listo:', representanteFinal._id);

  // 3. Equipo
  let equipoFinal;
  if (typeof equipo === 'string') {
    equipoFinal = await Equipo.findById(equipo).exec();
    if (!equipoFinal) throw new ValidationError('Equipo no encontrado');
    console.log('📌 Equipo encontrado por ID:', equipoFinal._id);
  } else {
    equipoFinal = await crearEquipoService({
      ...equipo,
      clienteActual: clienteFinal._id,
    });
    console.log('📌 Equipo creado:', equipoFinal._id);
  }

  // 4. Validar líneas de servicio
  if (!Array.isArray(lineasServicio) || lineasServicio.length === 0) {
    throw new ValidationError('Se requiere al menos una línea de servicio.');
  }

  const lineasServicioFinal = lineasServicio.map((linea, index) => {
    if (!linea.tipoTrabajo) {
      throw new ValidationError(
        `La línea ${index + 1} debe tener un tipoTrabajo.`
      );
    }

    if (!mongoose.Types.ObjectId.isValid(linea.tipoTrabajo)) {
      throw new ValidationError(
        `El tipoTrabajo en la línea ${index + 1} no es un ObjectId válido.`
      );
    }

    if (
      typeof linea.precioUnitario !== 'number' ||
      typeof linea.cantidad !== 'number'
    ) {
      throw new ValidationError(
        `La línea ${index + 1} debe tener precioUnitario y cantidad numéricos.`
      );
    }

    return {
      ...linea,
      tipoTrabajo: new mongoose.Types.ObjectId(linea.tipoTrabajo),
    };
  });

  const totalCalculado = lineasServicioFinal.reduce(
    (sum, linea) => sum + linea.precioUnitario * linea.cantidad,
    0
  );

  // 5. Crear orden de servicio
  const ordenServicio = new OrdenServicio({
    cliente: clienteFinal._id,
    representante: representanteFinal._id,
    equipo: equipoFinal._id,
    lineasServicio: lineasServicioFinal,
    tecnico,
    total: totalCalculado,
    fechaIngreso,
    diagnostico,
    estado,
    tipo,
    observaciones,
  });

  await ordenServicio.save();
  console.log('✅ Orden de Servicio guardada:', ordenServicio._id);

  // 6. Populate para respuesta
  await ordenServicio.populate([
    { path: 'cliente' },
    { path: 'representante' },
    { path: 'equipo' },
    { path: 'lineasServicio.tipoTrabajo' },
  ]);

  console.log('✅ Orden de Servicio populada y lista para retornar');
  return ordenServicio;
};

module.exports = crearOrdenServicioService;
