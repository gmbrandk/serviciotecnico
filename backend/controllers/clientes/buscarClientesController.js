// controllers/clientes/buscarClientesController.js

const buscarClientesService = require('@services/clientes/buscarClientesService');
const { ValidationError } = require('@utils/errors');

module.exports = async (req, res, next) => {
  try {
    console.log('[BuscarClientesController] Query:', req.query);

    const result = await buscarClientesService({
      dni: String(req.query.dni || '').trim(),
      nombre: String(req.query.nombre || '').trim(),
      telefono: String(req.query.telefono || '').trim(),
      email: String(req.query.email || '').trim(),
      mode: req.query.mode || 'autocomplete',
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      requester: req.user ? { id: req.user._id, role: req.user.role } : null,
    });

    console.log('[BuscarClientesController] Result count:', result.count);

    return res.json({
      ok: true,
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('[BuscarClientesController][Error]', err);

    if (err instanceof ValidationError) {
      return res.status(err.status || 400).json({
        success: false,
        ok: false,
        message: err.message,
        details: err.details,
      });
    }
    return next(err);
  }
};
