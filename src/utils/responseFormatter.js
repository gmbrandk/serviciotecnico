// ✅ Devuelve un formato estándar para respuestas exitosas
// ✅ Devuelve un formato estándar para respuestas exitosas
export const successResponse = ({
  status = 200,
  code = 'OK',
  message = 'Operación exitosa',
  details = null,
} = {}) => ({
  success: true,
  status,
  code,
  message,
  details,
});

// ✅ Devuelve un formato estándar para respuestas con error
export const errorResponse = (error, fallbackMessage = 'Error inesperado') => {
  const errData = error?.response?.data || {};
  const httpStatus = error?.response?.status || errData.status || 500;

  return {
    success: false,
    status: httpStatus,
    code: errData.code || 'UNKNOWN_ERROR',
    message:
      errData.message || errData.mensaje || error?.message || fallbackMessage,
    details: errData.details || null,
  };
};
