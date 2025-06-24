module.exports = ({ solicitante }) => {
  const rol = solicitante.role?.toLowerCase();

  if (rol !== 'superadministrador') {
    return {
      permitido: false,
      mensaje:
        'Solo los superadministradores pueden dar de baja definitivamente.',
    };
  }

  return { permitido: true };
};
