const xss = require('xss');
const crearClienteService = require('@services/clientes/crearClienteService');
const Cliente = require('@models/Cliente');
const { sendSuccess, sendError } = require('@utils/httpResponse');
const crearMovimiento = require('@controllers/movimiento/crearMovimientoController');
const TIPOS_MOVIMIENTO = require('@utils/constantes/tiposMovimiento');
const generarEmailFicticio = require('@utils/generarEmailFicticio');
const validarYFormatearTelefono = require('@utils/telefonia/validarYFormatearTelefono');

const crearClienteController = async (req, res) => {
  try {
    const camposPermitidos = [
      'nombre',
      'dni',
      'telefono',
      'direccion',
      'email',
    ];
    const bodyRecibido = req.body;
    const bodyFiltrado = {};
    const camposInvalidos = [];

    for (const campo in bodyRecibido) {
      const valor = bodyRecibido[campo];
      if (camposPermitidos.includes(campo)) {
        if (typeof valor === 'string' && /<|>/.test(valor)) {
          return sendError(
            res,
            400,
            `El campo ${campo} contiene caracteres no permitidos`
          );
        }
        bodyFiltrado[campo] = xss(valor);
      } else {
        camposInvalidos.push(campo);
      }
    }

    if (camposInvalidos.length > 0) {
      return sendError(
        res,
        400,
        `Los siguientes campos no están permitidos: ${camposInvalidos.join(
          ', '
        )}`
      );
    }

    const { nombre, dni, telefono } = bodyFiltrado;
    let { email } = bodyFiltrado;

    if (!nombre || !dni || !telefono) {
      return sendError(res, 400, 'Nombre, DNI y Teléfono son obligatorios');
    }

    // ☎️ Validar y formatear número de teléfono
    try {
      const infoTelefono = validarYFormatearTelefono(telefono);
      bodyFiltrado.telefono = infoTelefono.telefonoFormateado; // sobrescribimos con formato internacional
    } catch (error) {
      return sendError(res, 400, error.message);
    }

    const existeDni = await Cliente.findOne({ dni });
    if (existeDni)
      return sendError(res, 400, 'Ya existe un cliente con ese DNI');

    // 💡 Email obligatorio: generar si está vacío
    if (!email || email.trim() === '') {
      email = generarEmailFicticio({ nombre, dni });
      bodyFiltrado.email = email;
    }

    // Validar email generado o recibido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 400, 'El correo tiene un formato inválido');
    }

    const existeEmail = await Cliente.findOne({ email });
    if (existeEmail)
      return sendError(res, 400, 'Ya existe un cliente con ese correo');

    const existeTelefono = await Cliente.findOne({
      telefono: bodyFiltrado.telefono,
    });
    if (existeTelefono)
      return sendError(res, 400, 'Ya existe un cliente con ese teléfono');

    const cliente = await crearClienteService(bodyFiltrado);

    await crearMovimiento({
      tipo: TIPOS_MOVIMIENTO.CREAR,
      descripcion: `Se registró al cliente ${cliente.nombre}`,
      entidad: 'cliente',
      entidadId: cliente._id,
      usuarioId: req.usuario._id,
    });

    return sendSuccess(res, 201, 'Cliente creado correctamente', { cliente });
  } catch (error) {
    console.error('[crearClienteController]', error);
    return sendError(res, 500, 'Error al crear el cliente');
  }
};

module.exports = crearClienteController;
