module.exports = ({ solicitante }) => {
  const rol = solicitante.role?.toLowerCase();

  const rolesPermitidos = ['tecnico', 'administrador', 'superadministrador'];

  if (!rolesPermitidos.includes(rol)) {
    return {
      permitido: false,
      mensaje: 'No tienes permiso para crear clientes.',
    };
  }

  return { permitido: true };
};
