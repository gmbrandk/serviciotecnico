const xss = require('xss');
const crearClienteService = require('@services/clientes/crearClienteService');
const Cliente = require('@models/Cliente');
const { sendSuccess, sendError } = require('@utils/httpResponse');

const crearClienteController = async (req, res) => {
  try {
    const { nombre, dni, telefono, email, observaciones } = req.body;

    // 1. Validar campos obligatorios
    if (!nombre || !dni || !telefono) {
      return sendError(res, 400, 'Nombre, DNI y Teléfono son obligatorios');
    }

    // 2. Sanitizar inputs
    const campos = { nombre, dni, telefono, email, observaciones };
    for (const campo in campos) {
      if (campos[campo] && /<|>/.test(campos[campo])) {
        return sendError(
          res,
          400,
          `El campo ${campo} contiene caracteres no permitidos`
        );
      }
    }

    // Opcionalmente: limpiar con xss
    req.body.nombre = xss(nombre);
    req.body.dni = xss(dni);
    req.body.telefono = xss(telefono);
    req.body.email = xss(email);
    req.body.observaciones = xss(observaciones);

    // 3. Validar duplicados
    const existeDni = await Cliente.findOne({ dni });
    if (existeDni)
      return sendError(res, 400, 'Ya existe un cliente con ese DNI');

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return sendError(res, 400, 'El correo tiene un formato inválido');
      }

      const existeEmail = await Cliente.findOne({ email });
      if (existeEmail)
        return sendError(res, 400, 'Ya existe un cliente con ese correo');
    }

    const existeTelefono = await Cliente.findOne({ telefono });
    if (existeTelefono)
      return sendError(res, 400, 'Ya existe un cliente con ese teléfono');

    // 4. Crear cliente
    const cliente = await crearClienteService(req.body);
    return sendSuccess(res, 201, 'Cliente creado correctamente', { cliente });
  } catch (error) {
    console.error('[crearClienteController]', error);
    return sendError(res, 500, 'Error al crear el cliente');
  }
};

module.exports = crearClienteController;
