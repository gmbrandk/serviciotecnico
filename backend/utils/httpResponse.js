// utils/httpResponse.js

// 🔁 Función centralizada para dar formato uniforme a las respuestas HTTP
const httpResponse = (
  res,
  { status = 500, success = false, message, details = null }
) => {
  const payload = {
    success,
    ok: success, // 🔁 Compatibilidad con frontends que esperan "ok" en lugar de "success"
    message, // Mensaje en inglés
    mensaje: message, // 🔁 Alias en español para mayor legibilidad o compatibilidad
  };

  // 🔁 Si hay datos adicionales (por ejemplo: clientes, total), los agregamos bajo "details"
  if (details) payload.details = details;

  // ✅ Devolvemos la respuesta HTTP con el status y el payload estandarizado
  return res.status(status).json(payload);
};

// 🔴 Error genérico con mensaje y detalles opcionales
const sendError = (res, status, message, details = null) =>
  httpResponse(res, { status, success: false, message, details });

// 🟢 Éxito genérico con mensaje y detalles opcionales
const sendSuccess = (res, status, message, details = null) =>
  httpResponse(res, { status, success: true, message, details });

// ✅ Exportamos las tres variantes
module.exports = {
  httpResponse,
  sendError,
  sendSuccess,
};
