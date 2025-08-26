// 📁 services/equipos/crearEquipoService.js
const Equipo = require('@models/Equipo');
const FichaTecnica = require('@models/FichaTecnica');
const vincularFichaTecnica = require('@helpers/equipos/vincularFichaTecnica');
const inicializarHistorialClientes = require('@helpers/equipos/inicializarHistorialClientes');
const calcularEspecificacionesEquipo = require('@helpers/equipos/calcularEspecificacionesEquipo');
const { ValidationError } = require('@utils/errors');
const xss = require('xss');
const generarNombreTecnico = require('@utils/formatters/normalizarNombreTecnico');
const crearFichaTecnicaService = require('@services/fichaTecnica/crearFichaTecnicaService');

const crearEquipoService = async (data) => {
  console.log('▶️ [crearEquipoService] Iniciando con data:', data);

  const {
    tipo,
    marca,
    modelo,
    sku,
    nroSerie,
    macAddress,
    imei,
    clienteActual,
    fichaTecnicaManual,
    permitirCrearFichaTecnicaManual = false,
    ...resto
  } = data;

  // 🔹 Validaciones obligatorias
  if (!tipo?.trim()) {
    throw new ValidationError({
      code: 'REQUIRED_FIELD',
      message: 'El campo "tipo" es obligatorio',
      details: { field: 'tipo' },
    });
  }

  if (!modelo?.trim()) {
    throw new ValidationError({
      code: 'REQUIRED_FIELD',
      message: 'El campo "modelo" es obligatorio',
      details: { field: 'modelo' },
    });
  }

  if (!clienteActual) {
    throw new ValidationError({
      code: 'REQUIRED_FIELD',
      message: 'El campo "clienteActual" es obligatorio',
      details: { field: 'clienteActual' },
    });
  }

  // 🔹 Sanitización
  const tipoSanitizado = xss(tipo.trim().toLowerCase());
  const marcaSanitizada = marca ? xss(marca.trim()) : '';
  const modeloSanitizado = xss(modelo.trim());
  let skuSanitizado = sku ? xss(sku.trim().toUpperCase()) : null;
  let nroSerieSanitizado = nroSerie ? xss(nroSerie.trim().toUpperCase()) : null;
  const macSanitizado = macAddress
    ? xss(macAddress.trim().toUpperCase())
    : undefined;
  const imeiSanitizado = imei ? xss(imei.trim()) : undefined;

  // 🚩 Estado de identificación
  let estadoIdentificacion = 'definitiva';

  if (!skuSanitizado) {
    skuSanitizado = `TMP-SKU-${Date.now()}`;
    estadoIdentificacion = 'temporal';
  }

  if (!nroSerieSanitizado) {
    nroSerieSanitizado = `TMP-SN-${Date.now()}-${Math.floor(
      Math.random() * 9999
    )}`;
    estadoIdentificacion = 'temporal';
  }

  // 🧠 Nombre técnico
  const nombreTecnico = generarNombreTecnico(marcaSanitizada, modeloSanitizado);

  // 🔹 Validación condicional por tipo
  if (tipoSanitizado === 'celular' && !imeiSanitizado) {
    throw new ValidationError({
      code: 'REQUIRED_FIELD',
      message: 'El campo "imei" es obligatorio para celulares',
      details: { field: 'imei' },
    });
  }

  // 🔍 Validar duplicados (nroSerie > imei > mac)
  if (nroSerieSanitizado) {
    const existeSerie = await Equipo.findOne({ nroSerie: nroSerieSanitizado });
    if (existeSerie) {
      throw new ValidationError({
        code: 'DUPLICATE_NROSERIE',
        message: `Ya existe un equipo con el número de serie "${nroSerieSanitizado}"`,
        details: existeSerie,
      });
    }
  }

  if (imeiSanitizado) {
    const existeImei = await Equipo.findOne({ imei: imeiSanitizado });
    if (existeImei) {
      throw new ValidationError({
        code: 'DUPLICATE_IMEI',
        message: `Ya existe un equipo con el IMEI "${imeiSanitizado}"`,
        details: existeImei,
      });
    }
  }

  if (macSanitizado) {
    const existeMac = await Equipo.findOne({ macAddress: macSanitizado });
    if (existeMac) {
      throw new ValidationError({
        code: 'DUPLICATE_MAC',
        message: `Ya existe un equipo con la MAC "${macSanitizado}"`,
        details: existeMac,
      });
    }
  }

  // 🔍 Buscar ficha técnica automática
  let fichaTecnica;
  try {
    fichaTecnica = await vincularFichaTecnica({
      marca: marcaSanitizada,
      modelo: modeloSanitizado,
    });
  } catch (err) {
    console.error(
      '❌ [crearEquipoService] Error al vincular ficha técnica:',
      err
    );
    throw new ValidationError({
      code: 'FICHA_TECNICA_ERROR',
      message: 'Error al buscar la ficha técnica',
      details: { error: err.message },
    });
  }

  // 🧠 Crear ficha técnica manual si no existe
  if (!fichaTecnica && fichaTecnicaManual) {
    const fichaExistente = await FichaTecnica.findOne({
      modelo: nombreTecnico,
      sku: skuSanitizado,
      fuente: 'manual',
    });

    if (fichaExistente) {
      fichaTecnica = fichaExistente;
    } else if (permitirCrearFichaTecnicaManual) {
      if (skuSanitizado.startsWith('TMP-SKU')) {
        throw new ValidationError({
          code: 'INVALID_SKU',
          message:
            'Para crear una ficha técnica manual se requiere un SKU válido (no temporal)',
          details: { sku: skuSanitizado },
        });
      }

      fichaTecnica = await crearFichaTecnicaService({
        modelo: modeloSanitizado,
        sku: skuSanitizado,
        marca: marcaSanitizada,
        cpu: fichaTecnicaManual.cpu,
        gpu: fichaTecnicaManual.gpu,
        ram: fichaTecnicaManual.ram,
        almacenamiento: fichaTecnicaManual.almacenamiento,
        fuente: 'manual',
        estado: 'en_revision',
      });
    }
  }

  // 🧾 Historial cliente (nuevo equipo)
  const historialPropietarios = inicializarHistorialClientes(clienteActual);

  // ⚙️ Especificaciones
  const { especificacionesActuales, repotenciado } =
    calcularEspecificacionesEquipo(fichaTecnica, fichaTecnicaManual || {});

  // 🛠️ Crear equipo
  const equipoData = {
    tipo: tipoSanitizado,
    marca: marcaSanitizada,
    modelo: modeloSanitizado.toUpperCase(),
    sku: skuSanitizado,
    nroSerie: nroSerieSanitizado,
    macAddress: macSanitizado,
    imei: tipoSanitizado === 'celular' ? imeiSanitizado : undefined,
    estadoIdentificacion,
    clienteActual,
    fichaTecnica: fichaTecnica?._id || null,
    historialPropietarios,
    especificacionesActuales,
    repotenciado,
    ...resto,
  };

  console.log('📝 [crearEquipoService] Datos finales equipo:', equipoData);

  const nuevoEquipo = new Equipo(equipoData);
  const saved = await nuevoEquipo.save();

  console.log('✅ [crearEquipoService] Equipo creado con _id:', saved._id);

  return saved;
};

module.exports = crearEquipoService;
