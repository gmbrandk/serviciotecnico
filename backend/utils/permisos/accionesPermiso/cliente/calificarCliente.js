// utils/permisos/accionesPermiso/cliente/calificarCliente.js

const rolesJerarquia = require('../../rolesJerarquia');

module.exports = ({ jerarquiaSolicitante }) => {
  const jerarquiaMinima = rolesJerarquia['administrador'];

  if (jerarquiaSolicitante < jerarquiaMinima) {
    return {
      permitido: false,
      mensaje: 'No tienes permiso para calificar clientes.',
    };
  }

  return { permitido: true };
};
