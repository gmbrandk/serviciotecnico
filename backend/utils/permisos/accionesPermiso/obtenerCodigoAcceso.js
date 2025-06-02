// utils/permisos/accionesPermiso/obtenerCodigoAcceso.js
module.exports = ({ solicitante }) => {
  // Solo superadministradores o administradores pueden ver los códigos
  if (['superadministrador', 'administrador'].includes(solicitante.role)) {
    return { permitido: true };
  }

  return {
    permitido: false,
    mensaje: 'No tienes permiso para ver los códigos de acceso.',
  };
};
