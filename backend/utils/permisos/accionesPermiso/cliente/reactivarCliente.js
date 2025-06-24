module.exports = ({ solicitante }) => {
  const rol = solicitante.role?.toLowerCase();

  const rolesPermitidos = ['administrador', 'superadministrador'];

  if (!rolesPermitidos.includes(rol)) {
    return {
      permitido: false,
      mensaje: 'Solo los administradores pueden reactivar clientes.',
    };
  }

  return { permitido: true };
};
