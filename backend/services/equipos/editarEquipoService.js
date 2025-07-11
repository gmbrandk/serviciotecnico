const Equipo = require('@models/Equipo');
const FichaTecnica = require('@models/FichaTecnica');
const vincularFichaTecnica = require('@helpers/equipos/vincularFichaTecnica');
const inicializarHistorialClientes = require('@helpers/equipos/inicializarHistorialClientes');
const calcularEspecificacionesEquipo = require('@helpers/equipos/calcularEspecificacionesEquipo');
const { ValidationError, DuplicateError } = require('@utils/errors');
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
    ...resto
  } = data;

  if (!idEquipo) throw new ValidationError('ID de equipo no proporcionado');
  if (!modelo) throw new ValidationError('El campo "modelo" es obligatorio');
  if (!tipo) throw new ValidationError('El campo "tipo" es obligatorio');
  if (!clienteActual)
    throw new ValidationError('El campo "clienteActual" es obligatorio');

  const equipo = await Equipo.findById(idEquipo);
  if (!equipo) throw new ValidationError('Equipo no encontrado');

  const tipoSanitizado = xss(tipo.trim());
  const marcaSanitizada = marca ? xss(marca.trim()) : '';
  const modeloSanitizado = xss(modelo.trim());
  const skuSanitizado = sku ? xss(sku.trim().toUpperCase()) : undefined;

  const nombreTecnico = generarNombreTecnico(marcaSanitizada, modeloSanitizado);

  // 🔍 Buscar ficha técnica existente
  let fichaTecnica = await vincularFichaTecnica({
    marca: marcaSanitizada,
    modelo: modeloSanitizado,
  });

  // ❌ Si no existe y se permite crear manual
  if (!fichaTecnica && fichaTecnicaManual && permitirCrearFichaTecnicaManual) {
    const fichaExistente = await FichaTecnica.findOne({
      modelo: nombreTecnico,
      sku: skuSanitizado,
      fuente: 'manual',
    });

    if (fichaExistente) {
      fichaTecnica = fichaExistente;
    } else {
      const rol = usuarioSolicitante?.rol || 'tecnico';
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
          estado: 'en_revision', // 🔒 Todas nuevas en revisión
        });
      } catch (err) {
        throw new ValidationError(
          'Error al crear ficha técnica manual: ' + err.message
        );
      }
    }
  }

  // 🧮 Recalcular especificaciones
  const { especificacionesActuales, repotenciado } =
    calcularEspecificacionesEquipo(fichaTecnica, fichaTecnicaManual || {});

  // 📚 Historial clientes (si cambia)
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
      fichaTecnica: fichaTecnica?._id || null,
      historialPropietarios,
      especificacionesActuales,
      repotenciado,
      ...resto,
    },
    { new: true }
  );

  return actualizado;
};

module.exports = editarEquipoService;
