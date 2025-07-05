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
  // ✨ Desestructurar campos esperados del payload
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

  // 🚨 Validación mínima obligatoria
  // 🚨 Validaciones explícitas y separadas
  if (!tipo) {
    throw new ValidationError('El campo "tipo" es obligatorio');
  }

  if (!modelo) {
    throw new ValidationError('El campo "modelo" es obligatorio');
  }

  if (!clienteActual) {
    throw new ValidationError('El campo "clienteActual" es obligatorio');
  }

  // 🧼 Sanitización y formateo
  const modeloSanitizado = modelo.trim().toUpperCase();
  const skuSanitizado = sku?.trim().toUpperCase();
  const nroSerieSanitizado = nroSerie?.trim().toUpperCase();

  // 🔍 Validar duplicado de número de serie
  if (nroSerieSanitizado) {
    const yaExiste = await Equipo.findOne({ nroSerie: nroSerieSanitizado });
    if (yaExiste) {
      throw new DuplicateError('Ya existe un equipo con ese número de serie');
    }
  }

  // 🔍 Buscar plantilla técnica automática (de base de datos o API)
  let fichaTecnica;
  try {
    fichaTecnica = await vincularFichaTecnica({
      modelo: modeloSanitizado,
      sku: skuSanitizado,
    });
  } catch (err) {
    throw new Error('Error al buscar la ficha técnica: ' + err.message);
  }

  console.log(
    '[crearEquipoService] fichaTecnica encontrada:',
    fichaTecnica?._id || null
  );

  // 🧠 Si no se encontró una ficha automática Y se mandó fichaManual => crearla
  if (!fichaTecnica && fichaTecnicaManual) {
    // 🛡️ Verificar si ya existe una ficha técnica manual con modelo + sku
    const fichaExistente = await FichaTecnica.findOne({
      modelo: modeloSanitizado,
      sku: skuSanitizado,
      fuente: 'manual', // Solo buscamos fichas ingresadas manualmente
    });

    if (fichaExistente) {
      fichaTecnica = fichaExistente; // ✅ Usamos la ya existente
    } else {
      // ✅ Creamos una nueva ficha técnica manual
      const fichaManualData = {
        ...fichaTecnicaManual,
        modelo: modeloSanitizado,
        sku: skuSanitizado,
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
  }

  // 📜 Inicializamos historial de propietarios
  const historialPropietarios = inicializarHistorialClientes(clienteActual);

  // 🧠 Calculamos las especificaciones actuales y si está repotenciado
  const { especificacionesActuales, repotenciado } =
    calcularEspecificacionesEquipo(fichaTecnica, fichaTecnicaManual || {});

  // 🛠️ Creamos el nuevo equipo
  const nuevoEquipo = new Equipo({
    tipo: tipo.trim(),
    marca: marca?.trim(),
    modelo: modeloSanitizado,
    sku: skuSanitizado,
    nroSerie: nroSerieSanitizado,
    clienteActual,
    fichaTecnica: fichaTecnica?._id || null,
    historialPropietarios,
    especificacionesActuales,
    repotenciado,
    ...resto,
  });

  // 💾 Guardamos en la base de datos
  try {
    await nuevoEquipo.save();
  } catch (err) {
    throw new Error('Error al guardar el equipo: ' + err.message);
  }

  return nuevoEquipo;
};

module.exports = crearEquipoService;
