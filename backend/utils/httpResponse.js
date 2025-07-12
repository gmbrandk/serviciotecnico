const httpResponse = (
  res,
  { status = 500, success = false, message, details = null }
) => {
  const payload = {
    success,
    ok: success,
    message,
    mensaje: message,
  };

  if (details) payload.details = details;

  return res.status(Number(status)).json(payload);
};

// 🔴 Compatibilidad con ambos formatos (viejo y nuevo)
const sendError = (res, arg1, arg2, arg3) => {
  if (typeof arg1 === 'object') {
    // Nuevo formato: sendError(res, { status, message, details })
    return httpResponse(res, {
      status: arg1.status || 500,
      success: false,
      message: arg1.message,
      details: arg1.details || null,
    });
  } else {
    // Formato antiguo: sendError(res, status, message, details)
    return httpResponse(res, {
      status: arg1 || 500,
      success: false,
      message: arg2,
      details: arg3 || null,
    });
  }
};

// 🟢 Compatibilidad con ambos formatos (viejo y nuevo)
const sendSuccess = (res, arg1, arg2, arg3) => {
  if (typeof arg1 === 'object') {
    // Nuevo formato: sendSuccess(res, { status, message, details })
    return httpResponse(res, {
      status: arg1.status || 200,
      success: true,
      message: arg1.message,
      details: arg1.details || null,
    });
  } else {
    // Formato antiguo: sendSuccess(res, status, message, details)
    return httpResponse(res, {
      status: arg1 || 200,
      success: true,
      message: arg2,
      details: arg3 || null,
    });
  }
};

module.exports = {
  httpResponse,
  sendError,
  sendSuccess,
};
