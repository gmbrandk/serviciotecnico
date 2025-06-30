// utils/permisos/accionesPermiso/cliente/calificarCliente.js

const rolesJerarquia = require('../../rolesJerarquia');

module.exports = ({ jerarquiaSolicitante }) => {
  const jerarquiaMinima = rolesJerarquia['superadministrador'];

  if (jerarquiaSolicitante < jerarquiaMinima) {
    return {
      permitido: false,
      mensaje: 'No tienes permiso para banear clientes.',
    };
  }

  return { permitido: true };
};
