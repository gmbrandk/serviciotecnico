// utils/permisos/accionesPermiso/generarCodigo.js
// permisos/accionesPermiso/usuario/generarCodigoAcceso.js

const rolesJerarquia = require('../../rolesJerarquia');

module.exports = ({ solicitante, jerarquiaSolicitante }) => {
  const jerarquiaMinima = rolesJerarquia['administrador'];

  if (jerarquiaSolicitante < jerarquiaMinima) {
    return {
      permitido: false,
      mensaje: 'Solo administradores o superiores pueden generar códigos.',
    };
  }

  return { permitido: true };
};
