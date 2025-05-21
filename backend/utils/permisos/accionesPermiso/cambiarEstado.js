// permisos/accionesPermiso/cambiarEstado.js
module.exports = ({ solicitante, objetivo }) => {
  // Asumamos que aquí la regla es igual a la de editar, sólo que validamos que no se cambie su propio estado
  if (solicitante._id.toString() === objetivo._id.toString()) {
    return {
      permitido: false,
      mensaje: 'No puedes cambiar tu propio estado.',
    };
  }
  // Ejemplo simple, sólo permite a quien tiene jerarquía mayor (esto ya se valida antes en verificarPermiso)
  return { permitido: true };
};
