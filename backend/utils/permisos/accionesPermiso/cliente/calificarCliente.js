module.exports = ({ solicitante }) => {
  const rol = solicitante.role?.toLowerCase();

  const rolesPermitidos = ['administrador', 'superadministrador'];

  if (!rolesPermitidos.includes(rol)) {
    return {
      permitido: false,
      mensaje: 'No tienes permiso para calificar clientes.',
    };
  }

  return { permitido: true };
};
