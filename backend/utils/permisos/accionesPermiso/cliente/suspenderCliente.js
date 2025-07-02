// utils/permisos/accionesPermiso/cliente/calificarCliente.js

const rolesJerarquia = require('../../rolesJerarquia');

module.exports = ({ jerarquiaSolicitante }) => {
  const jerarquiaMinima = rolesJerarquia['tecnico'];

  if (jerarquiaSolicitante < jerarquiaMinima) {
    return {
      permitido: false,
      mensaje: 'No tienes permiso para suspender clientes.',
    };
  }

  return { permitido: true };
};
