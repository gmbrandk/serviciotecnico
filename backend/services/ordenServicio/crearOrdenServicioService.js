const OrdenServicio = require('@models/OrdenServicio');
const Cliente = require('@models/Cliente');
require('@models/TipodeTrabajo');
const Equipo = require('@models/Equipo');
const { ValidationError } = require('@utils/errors');
const mongoose = require('mongoose');
const crearClienteService = require('@services/clientes/crearClienteService');
const crearEquipoService = require('@services/equipos/crearEquipoService');

// 🔁 Reutilizable: busca o crea cliente/representante
const buscarOCrearCliente = async (persona) => {
  if (typeof persona === 'string') {
    const existente = await Cliente.findById(persona);
    if (!existente) throw new ValidationError('ID no encontrado');
    return existente;
  }

  let encontrado =
    (await Cliente.findOne({ dni: persona.dni })) ||
    (await Cliente.findOne({ email: persona.email })) ||
    (await Cliente.findOne({ telefono: persona.telefono }));

  if (!encontrado) {
    encontrado = new Cliente(persona);
    await encontrado.save();
  }

  return encontrado;
};

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
  } = data;

  // 1. Cliente
  const clienteFinal = await buscarOCrearCliente(cliente);
  console.log('✅ Cliente listo:', clienteFinal._id);

  // 2. Representante (opcional)
  let representanteFinal = null;

  if (representante) {
    representanteFinal = await buscarOCrearCliente(representante);
    console.log('✅ Representante proporcionado:', representanteFinal._id);
  } else {
    representanteFinal = clienteFinal;
    console.log(
      '👤 Representante no enviado. Usando cliente como representante:',
      representanteFinal._id
    );
  }

  // 3. Equipo
  let equipoFinal;

  if (typeof equipo === 'string') {
    equipoFinal = await Equipo.findById(equipo);
    if (!equipoFinal) throw new ValidationError('Equipo no encontrado');
    console.log('✅ Equipo encontrado por ID:', equipoFinal._id);
  } else {
    equipoFinal = await crearEquipoService({
      ...equipo,
      clienteActual: clienteFinal._id,
    });
    console.log('✅ Equipo creado mediante servicio:', equipoFinal._id);
  }

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

  // ✅ Lógica simple de sumatoria total
  const totalCalculado = lineasServicioFinal.reduce((sum, linea) => {
    return sum + linea.precioUnitario * linea.cantidad;
  }, 0);

  // 4. Crear la Orden de Servicio
  const ordenServicio = new OrdenServicio({
    cliente: clienteFinal._id,
    representante: representanteFinal._id,
    equipo: equipoFinal._id,
    lineasServicio: lineasServicioFinal,
    tecnico,
    total: totalCalculado, // <- ✅ aquí está la suma final real
    fechaIngreso,
    diagnostico,
    estado,
    tipo,
  });

  await ordenServicio.save();
  console.log('✅ Orden de Servicio guardada:', ordenServicio._id);

  // 5. Populate para respuesta legible
  await ordenServicio.populate([
    { path: 'cliente' },
    { path: 'representante' },
    { path: 'equipo' },
    { path: 'lineasServicio.tipoTrabajo' },
  ]);

  console.log('✅ Orden de Servicio populada. Lista para retornar.');
  return ordenServicio;
};

module.exports = crearOrdenServicioService;
