// 📁 services/equipos/crearEquipoService.js

const Equipo = require('@models/Equipo');
const FichaTecnica = require('@models/FichaTecnica');
const vincularFichaTecnica = require('@helpers/equipos/vincularFichaTecnica');
const inicializarHistorialClientes = require('@helpers/equipos/inicializarHistorialClientes');
const calcularEspecificacionesEquipo = require('@helpers/equipos/calcularEspecificacionesEquipo');
const { ValidationError, DuplicateError } = require('@utils/errors');
const xss = require('xss');
const generarNombreTecnico = require('@utils/formatters/normalizarNombreTecnico');

const crearEquipoService = async (data) => {
  const {
    tipo,
    marca,
    modelo,
    sku,
    nroSerie,
    clienteActual,
    fichaTecnicaManual,
    permitirCrearFichaTecnicaManual = false, // 🔍 Campo clave
    ...resto
  } = data;

  // 🚨 Validaciones obligatorias
  if (!tipo) throw new ValidationError('El campo "tipo" es obligatorio');
  if (!modelo) throw new ValidationError('El campo "modelo" es obligatorio');
  if (!clienteActual)
    throw new ValidationError('El campo "clienteActual" es obligatorio');

  // 🧼 Sanitización + XSS
  const tipoSanitizado = xss(tipo.trim());
  const marcaSanitizada = marca ? xss(marca.trim()) : '';
  const modeloSanitizado = xss(modelo.trim());
  const skuSanitizado = sku ? xss(sku.trim().toUpperCase()) : undefined;
  const nroSerieSanitizado = nroSerie
    ? xss(nroSerie.trim().toUpperCase())
    : undefined;

  // 🧠 Generar nombre técnico unificado
  const nombreTecnico = generarNombreTecnico(marcaSanitizada, modeloSanitizado);

  // 🔍 Validar duplicado de número de serie
  if (nroSerieSanitizado) {
    const yaExiste = await Equipo.findOne({ nroSerie: nroSerieSanitizado });
    if (yaExiste) {
      throw new DuplicateError('Ya existe un equipo con ese número de serie');
    }
  }

  // 🔍 Buscar plantilla técnica automática (modelo técnico)
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
      // Solo creamos si se ha permitido explícitamente
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
        modelo: nombreTecnico,
        modeloOriginal: modeloSanitizado,
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

  // 🧾 Inicializar historial del cliente
  const historialPropietarios = inicializarHistorialClientes(clienteActual);

  // ⚙️ Calcular especificaciones actuales y si fue repotenciado
  const { especificacionesActuales, repotenciado } =
    calcularEspecificacionesEquipo(fichaTecnica, fichaTecnicaManual || {});

  // 🛠️ Crear equipo
  const nuevoEquipo = new Equipo({
    tipo: tipoSanitizado,
    marca: marcaSanitizada,
    modelo: modeloSanitizado.toUpperCase(), // conservar original en mayúsculas
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
