// utils/permisos/accionesPermiso/equipo/obtenerEquipo.js

const rolesJerarquia = require('../../rolesJerarquia');

module.exports = ({ jerarquiaSolicitante }) => {
  const jerarquiaMinima = rolesJerarquia['tecnico'];

  if (jerarquiaSolicitante < jerarquiaMinima) {
    return {
      permitido: false,
      mensaje: 'No tienes permiso para ver equipos.',
    };
  }

  return { permitido: true };
};
