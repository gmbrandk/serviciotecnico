// 📁 services/equipos/crearEquipoService.js

const Equipo = require('@models/Equipo');
const FichaTecnica = require('@models/FichaTecnica');
const vincularFichaTecnica = require('@helpers/equipos/vincularFichaTecnica');
const inicializarHistorialClientes = require('@helpers/equipos/inicializarHistorialClientes');
const calcularEspecificacionesEquipo = require('@helpers/equipos/calcularEspecificacionesEquipo');
const {
  ValidationError,
  DuplicateError,
  NotFoundError,
} = require('@utils/errors');

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
    throw new ValidationError(
      'Los campos tipo, modelo y clienteActual son obligatorios'
    );
  }

  if (nroSerie?.trim()) {
    const yaExiste = await Equipo.findOne({ nroSerie: nroSerie.trim() });
    if (yaExiste) {
      throw new DuplicateError('Ya existe un equipo con ese número de serie');
    }
  }

  // Paso 1: Buscar plantilla de ficha técnica
  let fichaTecnica;
  try {
    fichaTecnica = await vincularFichaTecnica({ modelo, sku });
  } catch (err) {
    throw new Error('Error al buscar la ficha técnica: ' + err.message);
  }

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
    try {
      fichaTecnica = await FichaTecnica.create(fichaManualData);
    } catch (err) {
      throw new ValidationError(
        'Error al crear la ficha técnica manual: ' + err.message
      );
    }
  }

  // Paso 3: Inicializar historial
  const historialPropietarios = inicializarHistorialClientes(clienteActual);

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
    historialPropietarios,
    especificacionesActuales,
    repotenciado,
    ...resto,
  });

  try {
    await nuevoEquipo.save();
  } catch (err) {
    throw new Error('Error al guardar el equipo: ' + err.message);
  }

  return nuevoEquipo;
};

module.exports = crearEquipoService;
