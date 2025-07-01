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
    const bodySanitizado = {};

    const camposInvalidos = Object.keys(bodyRecibido).filter(
      (campo) => !camposPermitidos.includes(campo)
    );

    for (const campo of camposPermitidos) {
      const valor = bodyRecibido[campo];
      if (valor) {
        if (typeof valor === 'string' && /<|>/.test(valor)) {
          return sendError(
            res,
            400,
            `El campo ${campo} contiene caracteres no permitidos`
          );
        }
        bodySanitizado[campo] = xss(valor);
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

    const { nombre, dni, telefono } = bodySanitizado;

    if (!nombre?.trim()) {
      return sendError(res, 400, 'El nombre es obligatorio');
    }

    if (!dni?.trim()) {
      return sendError(res, 400, 'El DNI es obligatorio');
    }

    if (!telefono?.trim()) {
      return sendError(res, 400, 'El teléfono es obligatorio');
    }

    // ☎️ Validar y formatear número de teléfono
    try {
      const infoTelefono = validarYFormatearTelefono(telefono);
      bodySanitizado.telefono = infoTelefono.telefonoFormateado;
    } catch (error) {
      return sendError(res, 400, error.message);
    }

    const existeDni = await Cliente.findOne({ dni });
    if (existeDni)
      return sendError(res, 400, 'Ya existe un cliente con ese DNI');

    // 📧 Email obligatorio: generar si está vacío
    if (!bodySanitizado.email || bodySanitizado.email.trim() === '') {
      bodySanitizado.email = generarEmailFicticio({ nombre, dni });
    }

    // 📧 Validar email final
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

    if (bodySanitizado.email.includes('..')) {
      return sendError(
        res,
        400,
        'El correo tiene un formato inválido (doble punto)'
      );
    }

    if (!emailRegex.test(bodySanitizado.email)) {
      return sendError(res, 400, 'El correo tiene un formato inválido');
    }

    const existeEmail = await Cliente.findOne({ email: bodySanitizado.email });
    if (existeEmail)
      return sendError(res, 400, 'Ya existe un cliente con ese correo');

    const existeTelefono = await Cliente.findOne({
      telefono: bodySanitizado.telefono,
    });
    if (existeTelefono)
      return sendError(res, 400, 'Ya existe un cliente con ese teléfono');

    // 🛠 Crear cliente
    const cliente = await crearClienteService(bodySanitizado);

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
