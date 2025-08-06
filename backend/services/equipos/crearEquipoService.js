const Equipo = require('@models/Equipo');
const FichaTecnica = require('@models/FichaTecnica');
const vincularFichaTecnica = require('@helpers/equipos/vincularFichaTecnica');
const inicializarHistorialClientes = require('@helpers/equipos/inicializarHistorialClientes');
const calcularEspecificacionesEquipo = require('@helpers/equipos/calcularEspecificacionesEquipo');
const { ValidationError, DuplicateError } = require('@utils/errors');
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
    clienteActual,
    fichaTecnicaManual,
    permitirCrearFichaTecnicaManual = false,
    ...resto
  } = data;

  // 🔍 Validaciones
  if (!tipo) throw new ValidationError('El campo "tipo" es obligatorio');
  if (!modelo) throw new ValidationError('El campo "modelo" es obligatorio');
  if (!clienteActual) {
    throw new ValidationError('El campo "clienteActual" es obligatorio');
  }

  // 🧼 Sanitización
  const tipoSanitizado = xss(tipo.trim());
  const marcaSanitizada = marca ? xss(marca.trim()) : '';
  const modeloSanitizado = xss(modelo.trim());
  const skuSanitizado = sku ? xss(sku.trim().toUpperCase()) : undefined;
  const nroSerieSanitizado = nroSerie
    ? xss(nroSerie.trim().toUpperCase())
    : undefined;

  // 🧠 Nombre técnico
  const nombreTecnico = generarNombreTecnico(marcaSanitizada, modeloSanitizado);

  // ✅ Buscar si el equipo ya existe por número de serie
  let equipoExistente = null;
  if (nroSerieSanitizado) {
    equipoExistente = await Equipo.findOne({ nroSerie: nroSerieSanitizado });
  }

  if (equipoExistente) {
    const clienteAnteriorId = String(equipoExistente.clienteActual);
    const clienteNuevoId = String(clienteActual);

    if (clienteAnteriorId !== clienteNuevoId) {
      // ✅ Cerrar historial anterior
      const historialActivo = equipoExistente.historialPropietarios.find(
        (h) => String(h.clienteId) === clienteAnteriorId && h.fechaFin == null
      );

      if (historialActivo) {
        historialActivo.fechaFin = new Date();
      }

      // 🆕 Agregar nuevo historial
      equipoExistente.historialPropietarios.push({
        clienteId: clienteActual,
        fechaAsignacion: new Date(),
        fechaFin: null,
      });

      // 🔄 Actualizar cliente actual
      equipoExistente.clienteActual = clienteActual;
    }

    // ⚙️ Actualizar info base (opcional)
    equipoExistente.tipo = tipoSanitizado;
    equipoExistente.marca = marcaSanitizada;
    equipoExistente.modelo = modeloSanitizado.toUpperCase();
    equipoExistente.sku = skuSanitizado;
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
      if (!skuSanitizado) {
        throw new ValidationError(
          'Para crear una ficha técnica manual se requiere un SKU válido'
        );
      }

      try {
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
      } catch (err) {
        throw new ValidationError(
          'Error al crear ficha técnica manual: ' + err.message
        );
      }
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
