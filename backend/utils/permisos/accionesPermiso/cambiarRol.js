// Permite cambiar el rol de un usuario solo si:
// 1. El solicitante es de mayor jerarquía que el objetivo.
// 2. El nuevo rol es inferior al del solicitante.

const rolesJerarquia = require('../rolesJerarquia');

module.exports = ({ solicitante, objetivo, nuevoRol }) => {
  const jerarquiaSolicitante = rolesJerarquia[solicitante.role.toLowerCase()];
  const jerarquiaObjetivo = rolesJerarquia[objetivo.role.toLowerCase()];
  const jerarquiaNuevoRol = rolesJerarquia[nuevoRol?.toLowerCase()];

  if (jerarquiaSolicitante <= jerarquiaObjetivo) {
    return {
      permitido: false,
      mensaje:
        'No puedes cambiar el rol de un usuario de igual o mayor jerarquía.',
    };
  }

  if (jerarquiaNuevoRol >= jerarquiaSolicitante) {
    return {
      permitido: false,
      mensaje: 'No puedes asignar un rol igual o superior al tuyo.',
    };
  }

  return { permitido: true };
};
