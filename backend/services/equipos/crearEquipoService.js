const Equipo = require('@models/Equipo');
const FichaTecnica = require('@models/FichaTecnica');
const vincularFichaTecnica = require('@helpers/equipos/vincularFichaTecnica');
const inicializarHistorialClientes = require('@helpers/equipos/inicializarHistorialClientes');

const crearEquipoService = async (data) => {
  const {
    tipo,
    marca,
    modelo,
    sku,
    nroSerie,
    clienteActual,
    fichaTecnicaManual,
    ...resto
  } = data;

  if (!tipo || !modelo || !clienteActual) {
    throw new Error('Los campos tipo, modelo y clienteActual son obligatorios');
  }

  if (nroSerie?.trim()) {
    const yaExiste = await Equipo.findOne({ nroSerie: nroSerie.trim() });
    if (yaExiste) {
      throw new Error('Ya existe un equipo con ese número de serie');
    }
  }

  // Paso 1: Buscar ficha técnica existente
  let fichaTecnica = await vincularFichaTecnica({ modelo, sku });
  console.log(
    '[crearEquipoService] fichaTecnica encontrada:',
    fichaTecnica?._id || null
  );

  // Paso 2: Crear manualmente si no existe ninguna y viene una fichaManual
  if (!fichaTecnica && fichaTecnicaManual) {
    const fichaManualData = {
      ...fichaTecnicaManual,
      modelo: modelo?.trim(),
      sku: sku?.trim(),
      fuente: 'manual',
    };
    console.log(
      '[crearEquipoService] No se encontró ficha, creando manual:',
      fichaManualData
    );
    fichaTecnica = await FichaTecnica.create(fichaManualData);
  }

  // Paso 3: Inicializar historial de clientes
  const historialClientes = inicializarHistorialClientes(clienteActual);

  const nuevoEquipo = new Equipo({
    tipo: tipo.trim(),
    marca: marca?.trim(),
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
