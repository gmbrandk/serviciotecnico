const { generarEmailsFicticiosCliente } = require('@services/email.service');
const { sendSuccess, sendError } = require('@utils/httpResponse');

async function sugerirEmails(req, res) {
  try {
    const { nombres, apellidos, nombreCompleto } = req.body;

    if (!(nombres && apellidos) && !nombreCompleto) {
      return sendError(res, {
        status: 400,
        message: 'Debe enviar nombres y apellidos, o un nombreCompleto',
      });
    }

    const emails = generarEmailsFicticiosCliente({
      nombres,
      apellidos,
      nombreCompleto,
    });
    return sendSuccess(res, {
      status: 200,
      message: 'Opciones generadas',
      details: emails,
    });
  } catch (err) {
    return sendError(res, {
      status: 500,
      message: 'Error al generar emails',
      details: err.message,
    });
  }
}

module.exports = { sugerirEmails };
