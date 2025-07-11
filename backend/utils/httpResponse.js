// utils/httpResponse.js

// 🔁 Función centralizada para dar formato uniforme a las respuestas HTTP
const httpResponse = (
  res,
  { status = 500, success = false, message, details = null }
) => {
  const payload = {
    success,
    ok: success, // 🔁 Compatibilidad con frontends que esperan "ok" en lugar de "success"
    message, // 🧠 Mensaje en inglés
    mensaje: message, // 🔁 Alias en español para mayor legibilidad o compatibilidad
  };

  if (details) payload.details = details;

  return res.status(Number(status)).json(payload); // ✅ Se asegura que status sea número
};

// 🟥 Error genérico con objeto de opciones
const sendError = (res, { status = 500, message, details = null }) =>
  httpResponse(res, { status, success: false, message, details });

// 🟩 Éxito genérico con objeto de opciones
const sendSuccess = (res, { status = 200, message, details = null }) =>
  httpResponse(res, { status, success: true, message, details });

// ✅ Exportamos los helpers centralizados
module.exports = {
  httpResponse,
  sendError,
  sendSuccess,
};
