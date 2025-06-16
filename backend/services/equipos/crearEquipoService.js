// 📁 services/equipos/crearEquipoService.js

const Equipo = require('../../models/Equipo');
const vincularFichaTecnica = require('../../helpers/equipos/vincularFichaTecnica');
const inicializarHistorialClientes = require('../../helpers/equipos/inicializarHistorialClientes');

const crearEquipoService = async (data) => {
  const { tipo, marca, modelo, sku, nroSerie, clienteActual, ...resto } = data;

  if (!tipo || !modelo || !clienteActual) {
    throw new Error('Tipo, modelo y clienteActual son requeridos');
  }

  // Validar duplicado por nroSerie si viene
  if (nroSerie) {
    const existente = await Equipo.findOne({ nroSerie: nroSerie.trim() });
    if (existente) {
      throw new Error('Ya existe un equipo con ese número de serie');
    }
  }

  // Buscar ficha técnica por sku o modelo
  const fichaTecnica = await vincularFichaTecnica({ modelo, sku });

  // Historial inicial
  const historialClientes = inicializarHistorialClientes(clienteActual);

  const nuevoEquipo = new Equipo({
    tipo,
    marca,
    modelo: modelo.trim(),
    sku: sku?.trim(),
    nroSerie: nroSerie?.trim(),
    clienteActual,
    fichaTecnica: fichaTecnica?._id || null,
    historialClientes,
    ...resto,
  });

  await nuevoEquipo.save();

  return nuevoEquipo;
};

module.exports = crearEquipoService;
