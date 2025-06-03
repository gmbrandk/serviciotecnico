const CodigoAcceso = require('@models/CodigoAcceso');

const obtenerCodigosService = async ({ estado, creadoPor }) => {
  const filtro = {};
  if (estado) filtro.estado = estado;
  if (creadoPor) filtro.creadoPor = creadoPor;

  const codigos = await CodigoAcceso.find(filtro)
    .sort({ fechaCreacion: -1 })
    .populate('creadoPor', 'nombre email');

  return codigos.map((codigo) => ({
    id: codigo._id,
    codigo: codigo.codigo,
    estado: codigo.estado,
    usosDisponibles: codigo.usosDisponibles,
    fechaCreacion: codigo.fechaCreacion,
    creadoPor: codigo.creadoPor
      ? {
          id: codigo.creadoPor._id,
          nombre: codigo.creadoPor.nombre,
          email: codigo.creadoPor.email,
        }
      : null,
  }));
};

module.exports = obtenerCodigosService;
