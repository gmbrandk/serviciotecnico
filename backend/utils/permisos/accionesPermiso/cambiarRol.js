const rolesJerarquia = require('../rolesJerarquia');

module.exports = ({ solicitante, objetivo, nuevoRol }) => {
  const rolSolicitante = solicitante.role?.toLowerCase?.();
  const rolObjetivo = objetivo.role?.toLowerCase?.();
  const nuevoRolLower = nuevoRol?.toLowerCase?.();

  const jerarquiaSolicitante = rolesJerarquia[rolSolicitante];
  const jerarquiaNuevoRol = rolesJerarquia[nuevoRolLower];

  if (!jerarquiaNuevoRol) {
    return { permitido: false, mensaje: 'Rol no válido.' };
  }

  // No permitir que un usuario se cambie su propio rol
  if (solicitante.id === objetivo.id && nuevoRolLower !== rolSolicitante) {
    return { permitido: false, mensaje: 'No puedes modificar tu propio rol.' };
  }

  // No permitir asignar un rol superior al tuyo
  if (jerarquiaNuevoRol > jerarquiaSolicitante) {
    return { permitido: false, mensaje: 'No puedes asignar un rol superior al tuyo.' };
  }

  return { permitido: true };
};
