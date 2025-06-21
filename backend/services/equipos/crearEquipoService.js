const Equipo = require('@models/Equipo');
const FichaTecnica = require('@models/FichaTecnica');
const vincularFichaTecnica = require('@helpers/equipos/vincularFichaTecnica');
const inicializarHistorialClientes = require('@helpers/equipos/inicializarHistorialClientes');
const calcularEspecificacionesEquipo = require('@helpers/equipos/calcularEspecificacionesEquipo');

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

  // Paso 1: Buscar plantilla de ficha técnica
  let fichaTecnica = await vincularFichaTecnica({ modelo, sku });
  console.log(
    '[crearEquipoService] fichaTecnica encontrada:',
    fichaTecnica?._id || null
  );

  // Paso 2: Crear ficha técnica manual si no existe
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

  // Paso 3: Inicializar historial
  const historialClientes = inicializarHistorialClientes(clienteActual);

  // Paso 4: Calcular especificaciones actuales y si es repotenciado
  const { especificacionesActuales, repotenciado } =
    calcularEspecificacionesEquipo(fichaTecnica, fichaTecnicaManual || {});

  const nuevoEquipo = new Equipo({
    tipo: tipo.trim(),
    marca: marca?.trim(),
    modelo: modelo.trim(),
    sku: sku?.trim(),
    nroSerie: nroSerie?.trim(),
    clienteActual,
    fichaTecnica: fichaTecnica?._id || null,
    historialClientes,
    especificacionesActuales,
    repotenciado,
    ...resto,
  });

  await nuevoEquipo.save();
  return nuevoEquipo;
};

module.exports = crearEquipoService;
