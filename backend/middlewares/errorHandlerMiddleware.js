const errorHandlerMiddleware = (err, req, res, next) => {
    console.error('🔴 Error capturado:', err);
  
    let statusCode = 500;
    let mensaje = 'Error interno del servidor';
    let detalles = null;
  
    // Error de validación de Mongoose
    if (err.name === 'ValidationError') {
      statusCode = 400;
      mensaje = 'Error de validación de datos';
      detalles = err.message;
    }
  
    // Clave duplicada (correo u otro campo único)
    else if (err.code === 11000) {
      statusCode = 400;
      const campo = Object.keys(err.keyValue)[0];
      mensaje = `El valor del campo "${campo}" ya está registrado.`;
      detalles = err.keyValue;
    }
  
    // Errores personalizados (opcional)
    else if (err.customMessage) {
      statusCode = err.statusCode || 400;
      mensaje = err.customMessage;
      detalles = err.details || null;
    }
  
    res.status(statusCode).json({
      success: false,
      mensaje,
      ...(detalles && { detalles })
    });
  };
  
  module.exports = errorHandlerMiddleware;
  