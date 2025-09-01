// utils/permisos/accionesPermiso/equipo/crearEquipo.js

const rolesJerarquia = require('../../rolesJerarquia');

module.exports = ({ jerarquiaSolicitante }) => {
  const jerarquiaMinima = rolesJerarquia['tecnico'];

  if (jerarquiaSolicitante < jerarquiaMinima) {
    return {
      permitido: false,
      mensaje: 'No tienes permiso para buscar equipos.',
    };
  }

  return { permitido: true };
};
