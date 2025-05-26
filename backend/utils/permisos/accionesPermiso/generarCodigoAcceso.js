// utils/permisos/accionesPermiso/generarCodigo.js
module.exports = ({ solicitante }) => {
  const rol = solicitante.role?.toLowerCase();
  const rolesPermitidos = ['superadministrador', 'administrador'];

  if (!rolesPermitidos.includes(rol)) {
    return {
      permitido: false,
      mensaje: 'Solo administradores o superiores pueden generar códigos.',
    };
  }

  return { permitido: true };
};
