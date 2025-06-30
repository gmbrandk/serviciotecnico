// utils/permisos/accionesPermiso/cliente/crearCliente.js

const rolesJerarquia = require('../../rolesJerarquia');

module.exports = ({ jerarquiaSolicitante }) => {
  const jerarquiaMinima = rolesJerarquia['tecnico'];

  if (jerarquiaSolicitante < jerarquiaMinima) {
    return {
      permitido: false,
      mensaje: 'No tienes permiso para crear clientes.',
    };
  }

  return { permitido: true };
};
