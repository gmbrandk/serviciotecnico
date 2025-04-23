const rolesJerarquia = require('../rolesJerarquia');

module.exports = ({ solicitante, objetivo, nuevoRol }) => {
  const rolSolicitante = solicitante.role.toLowerCase();
  const nuevoRolLower = nuevoRol?.toLowerCase();
  const jerarquiaSolicitante = rolesJerarquia[rolSolicitante];
  const jerarquiaNuevoRol = rolesJerarquia[nuevoRolLower];

  if (!jerarquiaNuevoRol) return { permitido: false, mensaje: 'Rol no válido.' };
  if (jerarquiaNuevoRol < jerarquiaSolicitante) return { permitido: false, mensaje: 'No puedes asignar un rol superior al tuyo.' };
  if (solicitante.id === objetivo.id && jerarquiaNuevoRol < jerarquiaSolicitante)
    return { permitido: false, mensaje: 'No puedes aumentarte tu propio rol.' };
  if (solicitante.id === objetivo.id && rolSolicitante === 'superadministrador' && nuevoRolLower !== 'superadministrador')
    return { permitido: false, mensaje: 'El superadministrador no puede bajarse de rango.' };

  return { permitido: true };
};