// 📁 services/equipos/crearEquipoService.js

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
    usuarioSolicitante, // 🔍 Requerido para detectar rol
    ...resto
  } = data;

  if (!tipo) throw new ValidationError('El campo "tipo" es obligatorio');
  if (!modelo) throw new ValidationError('El campo "modelo" es obligatorio');
  if (!clienteActual)
    throw new ValidationError('El campo "clienteActual" es obligatorio');

  const tipoSanitizado = xss(tipo.trim());
  const marcaSanitizada = marca ? xss(marca.trim()) : '';
  const modeloSanitizado = xss(modelo.trim());
  const skuSanitizado = sku ? xss(sku.trim().toUpperCase()) : undefined;
  const nroSerieSanitizado = nroSerie
    ? xss(nroSerie.trim().toUpperCase())
    : undefined;

  const nombreTecnico = generarNombreTecnico(marcaSanitizada, modeloSanitizado);

  if (nroSerieSanitizado) {
    const yaExiste = await Equipo.findOne({ nroSerie: nroSerieSanitizado });
    if (yaExiste) {
      throw new DuplicateError('Ya existe un equipo con ese número de serie');
    }
  }

  let fichaTecnica;
  try {
    fichaTecnica = await vincularFichaTecnica({
      marca: marcaSanitizada,
      modelo: modeloSanitizado,
    });
  } catch (err) {
    throw new Error('Error al buscar la ficha técnica: ' + err.message);
  }

  console.log(
    '[crearEquipoService] fichaTecnica encontrada:',
    fichaTecnica?._id || null
  );

  if (!fichaTecnica && fichaTecnicaManual) {
    const fichaExistente = await FichaTecnica.findOne({
      modelo: nombreTecnico,
      sku: skuSanitizado,
      fuente: 'manual',
    });

    if (fichaExistente) {
      fichaTecnica = fichaExistente;
    } else if (permitirCrearFichaTecnicaManual) {
      // ✅ Determinar estado según rol
      const rol = usuarioSolicitante?.rol || 'tecnico'; // fallback por seguridad
      const estadoFicha = rol === 'tecnico' ? 'en_revision' : 'activa';

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
          estado: estadoFicha,
        });
      } catch (err) {
        throw new ValidationError(
          'Error al crear ficha técnica manual: ' + err.message
        );
      }
    }
  }

  const historialPropietarios = inicializarHistorialClientes(clienteActual);

  const { especificacionesActuales, repotenciado } =
    calcularEspecificacionesEquipo(fichaTecnica, fichaTecnicaManual || {});

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

  try {
    await nuevoEquipo.save();
  } catch (err) {
    throw new Error('Error al guardar el equipo: ' + err.message);
  }

  return nuevoEquipo;
};

module.exports = crearEquipoService;
