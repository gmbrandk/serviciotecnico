// utils/permisos/accionesPermiso/usuario/obtenerCodigoAcceso.js

const rolesJerarquia = require('../../rolesJerarquia');

module.exports = ({ jerarquiaSolicitante }) => {
  const jerarquiaMinima = rolesJerarquia['administrador'];

  if (jerarquiaSolicitante < jerarquiaMinima) {
    return {
      permitido: false,
      mensaje: 'No tienes permiso para ver a los usuarios.',
    };
  }

  return { permitido: true };
};
