// services/equipos/crearEquipoService.js
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

  // 🔍 Validaciones base
  if (!tipo) throw new ValidationError('El campo "tipo" es obligatorio');
  if (!modelo) throw new ValidationError('El campo "modelo" es obligatorio');
  if (!clienteActual) {
    throw new ValidationError('El campo "clienteActual" es obligatorio');
  }

  // 🧼 Sanitización
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

  // 🚨 SKU obligatorio (pero puede generarse temporal)
  if (!skuSanitizado) {
    skuSanitizado = `TMP-SKU-${Date.now()}`;
    estadoIdentificacion = 'temporal';
  }

  // 🚨 Nro de serie opcional (si no hay → generar temporal)
  if (!nroSerieSanitizado) {
    nroSerieSanitizado = `TMP-SN-${Date.now()}-${Math.floor(
      Math.random() * 9999
    )}`;
    estadoIdentificacion = 'temporal';
  }

  // 🧠 Nombre técnico
  const nombreTecnico = generarNombreTecnico(marcaSanitizada, modeloSanitizado);

  // 🚨 Validación condicional según tipo
  if (tipoSanitizado === 'celular') {
    if (!imeiSanitizado) {
      throw new ValidationError(
        'El campo "imei" es obligatorio para celulares'
      );
    }
  } else {
    // evitar que laptops/pcs guarden basura
    data.imei = undefined;
  }

  // ✅ Buscar si el equipo ya existe (prioridad: nroSerie > imei > macAddress)
  let equipoExistente = null;

  if (nroSerieSanitizado) {
    equipoExistente = await Equipo.findOne({ nroSerie: nroSerieSanitizado });
  }

  if (!equipoExistente && imeiSanitizado) {
    equipoExistente = await Equipo.findOne({ imei: imeiSanitizado });
  }

  if (!equipoExistente && macSanitizado) {
    equipoExistente = await Equipo.findOne({ macAddress: macSanitizado });
  }

  if (equipoExistente) {
    // ... 🔄 lógica de actualización de cliente e historial ...
    const clienteAnteriorId = String(equipoExistente.clienteActual);
    const clienteNuevoId = String(clienteActual);

    if (clienteAnteriorId !== clienteNuevoId) {
      const historialActivo = equipoExistente.historialPropietarios.find(
        (h) => String(h.clienteId) === clienteAnteriorId && h.fechaFin == null
      );

      if (historialActivo) {
        historialActivo.fechaFin = new Date();
      }

      equipoExistente.historialPropietarios.push({
        clienteId: clienteActual,
        fechaAsignacion: new Date(),
        fechaFin: null,
      });

      equipoExistente.clienteActual = clienteActual;
    }

    equipoExistente.tipo = tipoSanitizado;
    equipoExistente.marca = marcaSanitizada;
    equipoExistente.modelo = modeloSanitizado.toUpperCase();
    equipoExistente.sku = skuSanitizado;
    equipoExistente.nroSerie = nroSerieSanitizado;
    equipoExistente.macAddress = macSanitizado;
    equipoExistente.imei =
      tipoSanitizado === 'celular' ? imeiSanitizado : undefined;
    equipoExistente.estadoIdentificacion = estadoIdentificacion;
    Object.assign(equipoExistente, resto);

    await equipoExistente.save();
    return equipoExistente;
  }

  // 🔍 Buscar ficha técnica automática
  let fichaTecnica;
  try {
    fichaTecnica = await vincularFichaTecnica({
      marca: marcaSanitizada,
      modelo: modeloSanitizado,
    });
  } catch (err) {
    throw new Error('Error al buscar la ficha técnica: ' + err.message);
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
        throw new ValidationError(
          'Para crear una ficha técnica manual se requiere un SKU válido (no temporal)'
        );
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

  // 🛠️ Crear nuevo equipo
  const nuevoEquipo = new Equipo({
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
  });

  await nuevoEquipo.save();
  return nuevoEquipo;
};

module.exports = crearEquipoService;
