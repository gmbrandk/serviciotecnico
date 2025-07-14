const Equipo = require('@models/Equipo');
const FichaTecnica = require('@models/FichaTecnica');
const vincularFichaTecnica = require('@helpers/equipos/vincularFichaTecnica');
const inicializarHistorialClientes = require('@helpers/equipos/inicializarHistorialClientes');
const calcularEspecificacionesEquipo = require('@helpers/equipos/calcularEspecificacionesEquipo');
const { ValidationError } = require('@utils/errors');
const xss = require('xss');
const generarNombreTecnico = require('@utils/formatters/normalizarNombreTecnico');
const crearFichaTecnicaService = require('@services/fichaTecnica/crearFichaTecnicaService');
const normalizarSKU = require('@utils/formatters/normalizarSKU');

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
  const skuSanitizado = normalizarSKU(sku); // ✅ Normalización real
  const nombreTecnico = generarNombreTecnico(marcaSanitizada, modeloSanitizado);

  // 🔍 Validación explícita del SKU en conflicto con otra ficha
  const fichaConEseSKU = await FichaTecnica.findOne({ sku: skuSanitizado });
  if (fichaConEseSKU) {
    const mismaMarca =
      fichaConEseSKU.marca.trim().toUpperCase() ===
      marcaSanitizada.toUpperCase();
    const mismoModelo =
      fichaConEseSKU.modelo.trim().toUpperCase() ===
      modeloSanitizado.toUpperCase();

    if (!mismaMarca || !mismoModelo) {
      console.warn(
        '⚠️ [Service] SKU en uso por otra ficha con diferente marca/modelo'
      );
      throw new ValidationError(
        `El SKU "${skuSanitizado}" ya está asignado a otra ficha técnica con diferente marca o modelo: "${fichaConEseSKU.marca} ${fichaConEseSKU.modelo}".`
      );
    }
  }

  // 🔍 Buscar ficha técnica existente (ya se hacía)
  let fichaTecnicaNueva = await vincularFichaTecnica({
    sku: skuSanitizado,
    marca: marcaSanitizada,
    modelo: modeloSanitizado,
  });

  if (fichaTecnicaNueva) {
    console.log(
      '🟢 [Service] Ficha técnica encontrada:',
      fichaTecnicaNueva._id
    );
  }

  // 🧠 Crear ficha técnica manual si se permite (ya se hacía)
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
      console.log('🟠 [Service] Reutilizando ficha técnica manual existente');
      fichaTecnicaNueva = fichaExistente;
    } else {
      try {
        console.log('🟠 [Service] Creando ficha técnica manual...');
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

  // ⚖️ Validación flexible si el equipo ya tiene ficha y se intenta cambiar el SKU
  if (equipo.fichaTecnica && skuSanitizado) {
    const fichaActual = await FichaTecnica.findById(equipo.fichaTecnica);
    const skuActual = normalizarSKU(fichaActual?.sku);
    const esDiferente = skuActual && skuActual !== skuSanitizado;

    const coincideCPU =
      fichaActual?.cpu?.trim() === fichaTecnicaManual?.cpu?.trim();
    const coincideGPU =
      fichaActual?.gpu?.trim() === fichaTecnicaManual?.gpu?.trim();

    if (esDiferente && !(coincideCPU && coincideGPU)) {
      console.warn(
        '⚠️ [Service] Cambio de SKU no válido, componentes clave no coinciden.'
      );
      throw new ValidationError(
        `El SKU "${skuSanitizado}" difiere del ya vinculado y los componentes clave (CPU/GPU) no coinciden.`
      );
    }
  }

  // 🧪 Recalcular especificaciones
  console.log(
    '🧩 [Service] Ficha técnica base:',
    fichaTecnicaNueva || '❌ No definida'
  );
  console.log(
    '🧩 [Service] Ficha técnica manual recibida:',
    fichaTecnicaManual || '❌ No recibida'
  );

  const { especificacionesActuales, repotenciado } =
    calcularEspecificacionesEquipo(fichaTecnicaNueva, fichaTecnicaManual || {});

  console.log('🧪 [Service] Resultado repotenciado:', repotenciado);
  console.log(
    '🧪 [Service] Especificaciones finales:',
    especificacionesActuales
  );

  // 📚 Historial si cambia cliente (ya se hacía)
  let historialPropietarios = equipo.historialPropietarios || [];
  if (clienteActual.toString() !== equipo.clienteActual?.toString()) {
    historialPropietarios = inicializarHistorialClientes(
      clienteActual,
      historialPropietarios
    );
  }

  // 📝 Actualizar equipo
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
      ...resto,
    },
    { new: true }
  );

  return actualizado;
};

module.exports = editarEquipoService;
