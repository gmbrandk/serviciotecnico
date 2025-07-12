const Equipo = require('@models/Equipo');
const FichaTecnica = require('@models/FichaTecnica');
const vincularFichaTecnica = require('@helpers/equipos/vincularFichaTecnica');
const inicializarHistorialClientes = require('@helpers/equipos/inicializarHistorialClientes');
const calcularEspecificacionesEquipo = require('@helpers/equipos/calcularEspecificacionesEquipo');
const { ValidationError } = require('@utils/errors');
const xss = require('xss');
const generarNombreTecnico = require('@utils/formatters/normalizarNombreTecnico');
const crearFichaTecnicaService = require('@services/fichaTecnica/crearFichaTecnicaService');

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
    nroSerie, // 🔐 Se extrae explícitamente para evitar que quede en `resto`
    ...resto
  } = data;

  if (!idEquipo) throw new ValidationError('ID de equipo no proporcionado');
  if (!modelo) throw new ValidationError('El campo "modelo" es obligatorio');
  if (!tipo) throw new ValidationError('El campo "tipo" es obligatorio');
  if (!clienteActual)
    throw new ValidationError('El campo "clienteActual" es obligatorio');

  const equipo = await Equipo.findById(idEquipo);
  if (!equipo) throw new ValidationError('Equipo no encontrado');

  if (nroSerie !== undefined) {
    const nroSerieRecibido = xss(nroSerie.trim().toUpperCase());
    const nroSerieOriginal = (equipo.nroSerie || '').trim().toUpperCase();

    if (nroSerieRecibido !== nroSerieOriginal) {
      console.warn(
        '🔴 [Service] Intento de modificar el número de serie del equipo'
      );
      throw new ValidationError(
        'No está permitido modificar el número de serie del equipo. Deberás registrar un nuevo equipo si cambió.'
      );
    }
  }

  // 🧼 Sanitización
  const tipoSanitizado = xss(tipo.trim());
  const marcaSanitizada = marca ? xss(marca.trim()) : '';
  const modeloSanitizado = xss(modelo.trim());
  const skuSanitizado = sku ? xss(sku.trim().toUpperCase()) : undefined;

  const nombreTecnico = generarNombreTecnico(marcaSanitizada, modeloSanitizado);

  // 🔍 Buscar ficha técnica existente
  let fichaTecnicaNueva = await vincularFichaTecnica({
    sku: skuSanitizado,
    marca: marcaSanitizada,
    modelo: modeloSanitizado,
  });

  // 🧠 Crear ficha técnica manual si se permite
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

  // ✅ Si no se encontró nueva ficha técnica, mantener la anterior
  const fichaFinal = fichaTecnicaNueva?._id || equipo.fichaTecnica || null;

  // ⚙️ Recalcular especificaciones
  const { especificacionesActuales, repotenciado } =
    calcularEspecificacionesEquipo(fichaTecnicaNueva, fichaTecnicaManual || {});

  // 📚 Historial si cambia cliente
  let historialPropietarios = equipo.historialPropietarios || [];
  if (clienteActual.toString() !== equipo.clienteActual?.toString()) {
    historialPropietarios = inicializarHistorialClientes(
      clienteActual,
      historialPropietarios
    );
  }

  // ✏️ Actualizar equipo
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
      ...resto, // `nroSerie` ya no puede colarse aquí
    },
    { new: true }
  );

  return actualizado;
};

module.exports = editarEquipoService;
