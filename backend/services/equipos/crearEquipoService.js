// 📁 services/equipos/crearEquipoService.js
const Equipo = require('@models/Equipo');
const FichaTecnica = require('@models/FichaTecnica');
const vincularFichaTecnica = require('@services/equipos/vincularFichaTecnica');
const inicializarHistorialClientes = require('@helpers/equipos/inicializarHistorialClientes');
const calcularEspecificacionesEquipo = require('@helpers/equipos/calcularEspecificacionesEquipo');
const { ValidationError } = require('@utils/errors');
const xss = require('xss');

const {
  compararNroSeries,
  compararMacs,
  compararImeis,
} = require('@utils/validadores/validarIdentificadores');

// 🛠️ Nuestro normalizador configurable
const normalizeField = require('@utils/normalizeField');

const crearEquipoService = async (
  data,
  { strict = true, session = null } = {}
) => {
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

  // 🔹 Sanitización texto libre
  const tipoSanitizado = xss(tipo.trim().toLowerCase());
  const marcaSanitizada = marca ? xss(marca.trim()) : '';
  const modeloSanitizado = xss(modelo.trim());

  // 🔹 Normalización de identificadores
  const { original: skuOriginal, normalizado: skuNormalizado } = normalizeField(
    sku,
    { uppercase: true, removeNonAlnum: true }
  );

  const { original: nroSerieOriginal, normalizado: nroSerieNormalizado } =
    normalizeField(nroSerie, { uppercase: true, removeNonAlnum: true });

  const { original: macOriginal, normalizado: macNormalizado } = normalizeField(
    macAddress,
    { uppercase: true, removeNonAlnum: true }
  );

  const { original: imeiOriginal, normalizado: imeiNormalizado } =
    normalizeField(imei, { uppercase: true, removeNonAlnum: true });

  // 🚩 Estado de identificación
  let estadoIdentificacion = 'definitiva';

  let skuFinal = skuOriginal;
  if (!skuFinal) {
    skuFinal = `TMP-SKU-${Date.now()}`;
    estadoIdentificacion = 'temporal';
  }

  let nroSerieFinal = nroSerieOriginal;
  let nroSerieNormFinal = nroSerieNormalizado;
  if (!nroSerieFinal) {
    nroSerieFinal = `TMP-SN-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
    nroSerieNormFinal = nroSerieFinal; // el mismo tmp como normalizado
    estadoIdentificacion = 'temporal';
  }

  // 🔹 Validación condicional por tipo
  if (tipoSanitizado === 'celular' && !imeiNormalizado) {
    throw new ValidationError({
      code: 'REQUIRED_FIELD',
      message: 'El campo "imei" es obligatorio para celulares',
      details: { field: 'imei' },
    });
  }

  // =====================================================
  // 🔍 Validar duplicados nroSerie / imei / mac
  // =====================================================
  // 👉 Aquí ya usas los campos "normalizados" para buscar
  if (nroSerieNormFinal) {
    const equiposConSerie = await Equipo.find({
      nroSerieNormalizado: nroSerieNormFinal,
    }).session(session);

    for (const eq of equiposConSerie) {
      const encontrado = compararNroSeries(
        nroSerieNormFinal,
        eq.nroSerieNormalizado
      );
      if (encontrado.esExacto) {
        throw new ValidationError({
          code: 'DUPLICATE_SERIE',
          message: `NroSerie "${nroSerieFinal}" ya está registrado`,
          details: { equipoId: eq._id },
        });
      }
    }
  }

  if (imeiNormalizado) {
    const equiposConImei = await Equipo.find({
      imeiNormalizado,
    }).session(session);

    for (const eq of equiposConImei) {
      const encontrado = compararImeis(imeiNormalizado, eq.imeiNormalizado);
      if (encontrado.esExacto) {
        throw new ValidationError({
          code: 'DUPLICATE_IMEI',
          message: `IMEI "${imeiOriginal}" ya está registrado`,
          details: { equipoId: eq._id },
        });
      }
    }
  }

  if (macNormalizado) {
    const equiposConMac = await Equipo.find({
      macAddressNormalizado: macNormalizado,
    }).session(session);

    for (const eq of equiposConMac) {
      const encontrado = compararMacs(macNormalizado, eq.macAddressNormalizado);
      if (encontrado.esExacto) {
        throw new ValidationError({
          code: 'DUPLICATE_MAC',
          message: `MacAddress "${macOriginal}" ya está registrado`,
          details: { equipoId: eq._id },
        });
      }
    }
  }

  // =====================================================
  // 🔍 Buscar ficha técnica automática
  // =====================================================
  let fichaTecnica;
  try {
    fichaTecnica = await vincularFichaTecnica({
      marca: marcaSanitizada,
      modelo: modeloSanitizado,
      session,
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

  // 🧠 Crear ficha técnica manual si no existe...
  // (queda igual que antes)

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
    sku: skuFinal,
    skuNormalizado,
    nroSerie: nroSerieFinal,
    nroSerieNormalizado: nroSerieNormFinal,
    macAddress: macOriginal,
    macAddressNormalizado: macNormalizado,
    imei: tipoSanitizado === 'celular' ? imeiOriginal : undefined,
    imeiNormalizado: tipoSanitizado === 'celular' ? imeiNormalizado : undefined,
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
  const saved = await nuevoEquipo.save({ session });

  console.log('✅ [crearEquipoService] Equipo creado con _id:', saved._id);

  return saved;
};

module.exports = crearEquipoService;
