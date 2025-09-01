// 📁 services/equipos/editarEquipoService.js
const { Equipo } = require('@models/Equipo');
const FichaTecnica = require('@models/FichaTecnica');
const vincularFichaTecnica = require('@helpers/equipos/vincularFichaTecnica');
const actualizarHistorialClientes = require('@helpers/equipos/actualizarHistorialClientes');
const calcularEspecificacionesEquipo = require('@helpers/equipos/calcularEspecificacionesEquipo');
const { ValidationError } = require('@utils/errors');
const xss = require('xss');
const generarNombreTecnico = require('@utils/formatters/normalizarNombreTecnico');
const crearFichaTecnicaService = require('@services/fichaTecnica/crearFichaTecnicaService');
const normalizarSKU = require('@utils/formatters/normalizarSKU');

const {
  compararMacs,
  compararImeis,
} = require('@utils/validadores/validarIdentificadores');

const editarEquipoService = async (idEquipo, data) => {
  const {
    tipo,
    marca,
    modelo,
    sku,
    clienteActual,
    fichaTecnicaManual,
    permitirCrearFichaTecnicaManual = false,
    usuarioSolicitante,
    nroSerie,
    macAddress,
    imei,
    ...resto
  } = data;

  if (!idEquipo) throw new ValidationError('ID de equipo no proporcionado');
  if (!modelo) throw new ValidationError('El campo "modelo" es obligatorio');
  if (!tipo) throw new ValidationError('El campo "tipo" es obligatorio');
  if (!clienteActual)
    throw new ValidationError('El campo "clienteActual" es obligatorio');
  if (!sku || !sku.trim()) {
    throw new ValidationError(
      'El campo "SKU" es obligatorio y no puede estar vacío'
    );
  }

  const equipo = await Equipo.findById(idEquipo);
  if (!equipo) throw new ValidationError('Equipo no encontrado');

  // 🛡️ Validar intento de cambiar número de serie
  if (nroSerie !== undefined) {
    const nroSerieRecibido = xss(nroSerie.trim().toUpperCase());
    const nroSerieOriginal = (equipo.nroSerie || '').trim().toUpperCase();

    if (nroSerieRecibido !== nroSerieOriginal) {
      console.warn('🔴 [Service] Intento de modificar el número de serie');
      throw new ValidationError(
        'No está permitido modificar el número de serie. Registra un nuevo equipo si cambió.'
      );
    }
  }

  // 🧼 Sanitización y normalización
  const tipoSanitizado = xss(tipo.trim());
  const marcaSanitizada = xss(marca?.trim() || '');
  const modeloSanitizado = xss(modelo?.trim() || '');
  const skuSanitizado = normalizarSKU(sku);
  const nombreTecnico = generarNombreTecnico(marcaSanitizada, modeloSanitizado);

  // =====================================================
  // 🔍 Validar duplicados (IMEI, MAC) solo si cambian
  // =====================================================
  if (imei && tipoSanitizado.toLowerCase() === 'smartphone') {
    if (imei !== equipo.imei) {
      const equiposConImei = await Equipo.find({
        imeiNormalizado: imei.trim().toUpperCase(),
      });
      for (const eq of equiposConImei) {
        const encontrado = compararImeis(
          imei.trim().toUpperCase(),
          eq.imeiNormalizado
        );
        if (
          encontrado.esExacto &&
          eq._id.toString() !== equipo._id.toString()
        ) {
          throw new ValidationError(
            `El IMEI "${imei}" ya está registrado en otro equipo`
          );
        }
      }
    }
  }

  if (macAddress && macAddress !== equipo.macAddress) {
    const macNormalizado = macAddress.trim().toUpperCase();
    const equiposConMac = await Equipo.find({
      macAddressNormalizado: macNormalizado,
    });
    for (const eq of equiposConMac) {
      const encontrado = compararMacs(macNormalizado, eq.macAddressNormalizado);
      if (encontrado.esExacto && eq._id.toString() !== equipo._id.toString()) {
        throw new ValidationError(
          `La dirección MAC "${macAddress}" ya está registrada en otro equipo`
        );
      }
    }
  }

  // =====================================================
  // 🔍 Vincular o crear ficha técnica
  // =====================================================
  let fichaTecnicaNueva = await vincularFichaTecnica({
    sku: skuSanitizado,
    marca: marcaSanitizada,
    modelo: modeloSanitizado,
  });

  if (
    !fichaTecnicaNueva &&
    fichaTecnicaManual &&
    permitirCrearFichaTecnicaManual
  ) {
    const fichaExistente = await FichaTecnica.findOne({
      modelo: nombreTecnico,
      sku: skuSanitizado,
      fuente: 'manual',
    });

    if (fichaExistente) {
      fichaTecnicaNueva = fichaExistente;
    } else {
      try {
        fichaTecnicaNueva = await crearFichaTecnicaService({
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
      } catch (err) {
        throw new ValidationError(
          'Error al crear ficha técnica manual: ' + err.message
        );
      }
    }
  }

  const fichaFinal = fichaTecnicaNueva?._id || equipo.fichaTecnica || null;

  // =====================================================
  // 🧪 Recalcular especificaciones
  // =====================================================
  const { especificacionesActuales, repotenciado } =
    calcularEspecificacionesEquipo(fichaTecnicaNueva, fichaTecnicaManual || {});

  // =====================================================
  // 📚 Historial si cambia cliente
  // =====================================================
  let historialPropietarios = equipo.historialPropietarios || [];
  if (clienteActual.toString() !== equipo.clienteActual?.toString()) {
    historialPropietarios = actualizarHistorialClientes(
      historialPropietarios,
      clienteActual,
      { usuarioId: usuarioSolicitante?._id }
    );
  }

  // =====================================================
  // 📝 Actualizar equipo
  // =====================================================
  const actualizado = await Equipo.findByIdAndUpdate(
    idEquipo,
    {
      tipo: tipoSanitizado,
      marca: marcaSanitizada,
      modelo: modeloSanitizado.toUpperCase(),
      sku: skuSanitizado,
      clienteActual,
      fichaTecnica: fichaFinal,
      historialPropietarios,
      especificacionesActuales,
      repotenciado,
      macAddress: macAddress || equipo.macAddress,
      imei: imei || equipo.imei,
      ...resto,
    },
    { new: true }
  );

  return actualizado;
};

module.exports = editarEquipoService;
