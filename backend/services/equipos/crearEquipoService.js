// 📁 services/equipos/crearEquipoService.js

const Equipo = require('@models/Equipo');
const FichaTecnica = require('@models/FichaTecnica');
const vincularFichaTecnica = require('@helpers/equipos/vincularFichaTecnica');
const inicializarHistorialClientes = require('@helpers/equipos/inicializarHistorialClientes');
const calcularEspecificacionesEquipo = require('@helpers/equipos/calcularEspecificacionesEquipo');
const { ValidationError, DuplicateError } = require('@utils/errors');
const xss = require('xss'); // ✅ Protección anti-XSS

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

  // 🚨 Validaciones explícitas
  if (!tipo) throw new ValidationError('El campo "tipo" es obligatorio');
  if (!modelo) throw new ValidationError('El campo "modelo" es obligatorio');
  if (!clienteActual)
    throw new ValidationError('El campo "clienteActual" es obligatorio');

  // 🧼 Sanitización + Protección XSS + Formato
  const tipoSanitizado = xss(tipo.trim());
  const marcaSanitizada = marca ? xss(marca.trim()) : undefined;
  const modeloSanitizado = xss(modelo.trim().toUpperCase());
  const skuSanitizado = sku ? xss(sku.trim().toUpperCase()) : undefined;
  const nroSerieSanitizado = nroSerie
    ? xss(nroSerie.trim().toUpperCase())
    : undefined;

  // 🔍 Validar duplicado de número de serie
  if (nroSerieSanitizado) {
    const yaExiste = await Equipo.findOne({ nroSerie: nroSerieSanitizado });
    if (yaExiste) {
      throw new DuplicateError('Ya existe un equipo con ese número de serie');
    }
  }

  // 🔍 Buscar plantilla técnica automática
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

  // 🧠 Crear ficha técnica manual si no existe
  if (!fichaTecnica && fichaTecnicaManual) {
    const fichaExistente = await FichaTecnica.findOne({
      modelo: modeloSanitizado,
      sku: skuSanitizado,
      fuente: 'manual',
    });

    if (fichaExistente) {
      fichaTecnica = fichaExistente;
    } else {
      // 🧼 Limpiar campos internos de ficha técnica
      const fichaManualSanitizada = {
        cpu: fichaTecnicaManual.cpu
          ? xss(fichaTecnicaManual.cpu.trim())
          : undefined,
        gpu: fichaTecnicaManual.gpu
          ? xss(fichaTecnicaManual.gpu.trim())
          : undefined,
        ram: fichaTecnicaManual.ram
          ? xss(fichaTecnicaManual.ram.trim())
          : undefined,
        almacenamiento: fichaTecnicaManual.almacenamiento
          ? xss(fichaTecnicaManual.almacenamiento.trim())
          : undefined,
        pantalla: fichaTecnicaManual.pantalla
          ? xss(fichaTecnicaManual.pantalla.trim())
          : undefined,
      };

      const fichaManualData = {
        ...fichaManualSanitizada,
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

  // 📜 Inicializar historial
  const historialPropietarios = inicializarHistorialClientes(clienteActual);

  // 🧠 Especificaciones + repotenciado
  const { especificacionesActuales, repotenciado } =
    calcularEspecificacionesEquipo(fichaTecnica, fichaTecnicaManual || {});

  // 🛠️ Crear equipo
  const nuevoEquipo = new Equipo({
    tipo: tipoSanitizado,
    marca: marcaSanitizada,
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

  try {
    await nuevoEquipo.save();
  } catch (err) {
    throw new Error('Error al guardar el equipo: ' + err.message);
  }

  return nuevoEquipo;
};

module.exports = crearEquipoService;
