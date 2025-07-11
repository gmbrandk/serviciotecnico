// utils/permisos/accionesPermiso/equipo/cambiarEstadoEquipo.js

const rolesJerarquia = require('../../rolesJerarquia');

module.exports = ({ jerarquiaSolicitante }) => {
  const jerarquiaMinima = rolesJerarquia['administrador'];

  if (jerarquiaSolicitante < jerarquiaMinima) {
    return {
      permitido: false,
      mensaje:
        'Solo administradores o superiores pueden cambiar el estado de un equipo.',
    };
  }

  return { permitido: true };
};
