// 📁 services/equipos/crearEquipoService.js
const { Equipo, Smartphone, Laptop } = require('@models/Equipo');
const FichaTecnica = require('@models/FichaTecnica');
const vincularFichaTecnica = require('@services/equipos/vincularFichaTecnica');
const inicializarHistorialClientes = require('@helpers/equipos/inicializarHistorialClientes');
const calcularEspecificacionesEquipo = require('@helpers/equipos/calcularEspecificacionesEquipo');
const crearFichaTecnicaService = require('@services/fichaTecnica/crearFichaTecnicaService');

const { ValidationError } = require('@utils/errors');
const xss = require('xss');

const {
  compararNroSeries,
  compararMacs,
  compararImeis,
} = require('@utils/validadores/validarIdentificadores');

const {
  generarSkuTemporal,
  generarNroSerieTemporal,
  generarMacProvisional,
} = require('@utils/generadores/generarIdentificadoresTemporales');

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

  // 🔹 Aseguramos que clienteActual siempre sea un ObjectId limpio
  const clienteId =
    typeof clienteActual === 'object' && clienteActual._id
      ? clienteActual._id
      : clienteActual;

  // 🔹 Sanitización
  const tipoSanitizado = xss(tipo.trim().toLowerCase());
  const marcaSanitizada = marca ? xss(marca.trim()) : '';
  const modeloSanitizado = xss(modelo.trim());

  // 🔹 Normalización
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
  let skuFinal = skuOriginal || generarSkuTemporal();
  if (!skuOriginal) estadoIdentificacion = 'temporal';

  let nroSerieFinal = nroSerieOriginal || generarNroSerieTemporal();
  let nroSerieNormFinal = nroSerieNormalizado || nroSerieFinal;
  if (!nroSerieOriginal) estadoIdentificacion = 'temporal';

  let macFinal = macOriginal || generarMacProvisional();
  let macNormFinal = macNormalizado || macFinal;
  if (!macOriginal) estadoIdentificacion = 'temporal';

  // 🔹 Validación condicional por tipo
  if (tipoSanitizado === 'smartphone' && !imeiNormalizado) {
    throw new ValidationError({
      code: 'REQUIRED_FIELD',
      message: 'El campo "imei" es obligatorio para smartphones',
      details: { field: 'imei' },
    });
  }

  // =====================================================
  // 🔍 Validar duplicados (nroSerie, imei, mac)
  // =====================================================
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

  if (imeiNormalizado && tipoSanitizado === 'smartphone') {
    const equiposConImei = await Equipo.find({ imeiNormalizado }).session(
      session
    );
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

  if (macNormFinal) {
    const equiposConMac = await Equipo.find({
      macAddressNormalizado: macNormFinal,
    }).session(session);
    for (const eq of equiposConMac) {
      const encontrado = compararMacs(macNormFinal, eq.macAddressNormalizado);
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
  // 🔍 Vincular ficha técnica
  // =====================================================
  // =====================================================
  // 🔍 Vincular ficha técnica o crear nueva si es necesario
  // =====================================================
  let fichaTecnica;
  try {
    fichaTecnica = await vincularFichaTecnica({
      marca: marcaSanitizada,
      modelo: modeloSanitizado,
      sku: skuOriginal,
      session,
    });

    // 🚀 Si no existe y se permite crear manualmente
    if (
      !fichaTecnica &&
      permitirCrearFichaTecnicaManual &&
      fichaTecnicaManual
    ) {
      fichaTecnica = await crearFichaTecnicaService({
        modelo: modeloSanitizado,
        sku: skuOriginal || generarSkuTemporal(),
        marca: marcaSanitizada,
        cpu: fichaTecnicaManual.cpu,
        gpu: fichaTecnicaManual.gpu,
        ram: fichaTecnicaManual.ram,
        almacenamiento: fichaTecnicaManual.almacenamiento,
        fuente: 'manual',
        estado: 'activa',
      });
    }
  } catch (err) {
    console.error('❌ [crearEquipoService] Error con ficha técnica:', err);
    throw new ValidationError({
      code: 'FICHA_TECNICA_ERROR',
      message: 'Error al vincular o crear la ficha técnica',
      details: { error: err.message },
    });
  }

  // 🧾 Historial propietario
  const historialPropietarios = inicializarHistorialClientes(clienteId, {
    usuarioId: session?.usuario?._id || null,
  });

  // ⚙️ Especificaciones
  const { especificacionesActuales, repotenciado } =
    calcularEspecificacionesEquipo(fichaTecnica, fichaTecnicaManual || {});

  // =====================================================
  // 🛠️ Crear equipo según tipo (discriminador)
  // =====================================================
  let nuevoEquipo;

  if (tipoSanitizado === 'smartphone') {
    nuevoEquipo = new Smartphone({
      tipo: 'smartphone',
      marca: marcaSanitizada,
      modelo: modeloSanitizado.toUpperCase(),
      sku: skuFinal,
      skuNormalizado,
      nroSerie: nroSerieFinal,
      nroSerieNormalizado: nroSerieNormFinal,
      macAddress: macFinal,
      macAddressNormalizado: macNormFinal,
      imei: imeiOriginal,
      imeiNormalizado,
      estadoIdentificacion,
      clienteActual: clienteId,
      fichaTecnica: fichaTecnica?._id || null,
      historialPropietarios,
      especificacionesActuales,
      repotenciado,
      ...resto,
    });
  } else if (tipoSanitizado === 'laptop') {
    nuevoEquipo = new Laptop({
      tipo: 'laptop',
      marca: marcaSanitizada,
      modelo: modeloSanitizado.toUpperCase(),
      sku: skuFinal,
      skuNormalizado,
      nroSerie: nroSerieFinal,
      nroSerieNormalizado: nroSerieNormFinal,
      macAddress: macFinal,
      macAddressNormalizado: macNormFinal,
      estadoIdentificacion,
      clienteActual: clienteId,
      fichaTecnica: fichaTecnica?._id || null,
      historialPropietarios,
      especificacionesActuales,
      repotenciado,
      ...resto,
    });
  } else {
    // fallback genérico
    nuevoEquipo = new Equipo({
      tipo: tipoSanitizado,
      marca: marcaSanitizada,
      modelo: modeloSanitizado.toUpperCase(),
      sku: skuFinal,
      skuNormalizado,
      nroSerie: nroSerieFinal,
      nroSerieNormalizado: nroSerieNormFinal,
      macAddress: macFinal,
      macAddressNormalizado: macNormFinal,
      estadoIdentificacion,
      clienteActual: clienteId,
      fichaTecnica: fichaTecnica?._id || null,
      historialPropietarios,
      especificacionesActuales,
      repotenciado,
      ...resto,
    });
  }

  const saved = await nuevoEquipo.save({ session });
  console.log('✅ [crearEquipoService] Equipo creado con _id:', saved._id);

  return saved;
};

module.exports = crearEquipoService;
