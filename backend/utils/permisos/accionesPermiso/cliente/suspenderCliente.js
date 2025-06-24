module.exports = ({ solicitante }) => {
  const rol = solicitante.role?.toLowerCase();

  const rolesPermitidos = ['administrador', 'superadministrador']; // 🔐 solo rangos más altos

  if (!rolesPermitidos.includes(rol)) {
    return {
      permitido: false,
      mensaje: 'No tienes permiso para suspender clientes.',
    };
  }

  return { permitido: true };
};
