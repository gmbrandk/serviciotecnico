// utils/httpResponse.js

const httpResponse = (
  res,
  { status = 500, success = false, message, details = null }
) => {
  const payload = {
    success,
    ok: success, // 🔁 Compatibilidad
    message,
    mensaje: message, // 🔁 Compatibilidad
  };

  if (details) payload.details = details;

  return res.status(status).json(payload);
};

const sendError = (res, status, message, details = null) =>
  httpResponse(res, { status, success: false, message, details });

const sendSuccess = (res, status, message, details = null) =>
  httpResponse(res, { status, success: true, message, details });

module.exports = {
  httpResponse,
  sendError,
  sendSuccess,
};
