const xss = require('xss');
const crearClienteService = require('@services/clientes/crearClienteService');
const Cliente = require('@models/Cliente');
const { sendSuccess, sendError } = require('@utils/httpResponse');
const crearMovimiento = require('@controllers/movimiento/crearMovimientoController');

const crearClienteController = async (req, res) => {
  try {
    const camposPermitidos = [
      'nombre',
      'dni',
      'telefono',
      'email',
      'observaciones',
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

    const { nombre, dni, telefono, email } = bodyFiltrado;
    if (!nombre || !dni || !telefono) {
      return sendError(res, 400, 'Nombre, DNI y Teléfono son obligatorios');
    }

    const existeDni = await Cliente.findOne({ dni });
    if (existeDni)
      return sendError(res, 400, 'Ya existe un cliente con ese DNI');

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email))
        return sendError(res, 400, 'El correo tiene un formato inválido');

      const existeEmail = await Cliente.findOne({ email });
      if (existeEmail)
        return sendError(res, 400, 'Ya existe un cliente con ese correo');
    }

    const existeTelefono = await Cliente.findOne({ telefono });
    if (existeTelefono)
      return sendError(res, 400, 'Ya existe un cliente con ese teléfono');

    const cliente = await crearClienteService(bodyFiltrado);

    // 🧾 Registrar movimiento
    await crearMovimiento({
      tipo: 'creacion',
      descripcion: `Se registró al cliente ${cliente.nombre}`,
      entidad: 'cliente',
      entidadId: cliente._id,
      usuarioId: req.usuario._id,
      usadoPor: req.usuario.nombre,
    });

    return sendSuccess(res, 201, 'Cliente creado correctamente', { cliente });
  } catch (error) {
    console.error('[crearClienteController]', error);
    return sendError(res, 500, 'Error al crear el cliente');
  }
};

module.exports = crearClienteController;
