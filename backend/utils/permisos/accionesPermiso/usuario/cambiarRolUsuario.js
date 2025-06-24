// Permite cambiar el rol de un usuario solo si:
// 1. El solicitante es de mayor jerarquía que el objetivo.
// 2. El nuevo rol es inferior al del solicitante.

const rolesJerarquia = require('../../rolesJerarquia');

module.exports = ({ solicitante, objetivo, nuevoRol }) => {
  const jerarquiaSolicitante = rolesJerarquia[solicitante.role.toLowerCase()];
  const jerarquiaObjetivo = rolesJerarquia[objetivo.role.toLowerCase()];
  const jerarquiaNuevoRol = rolesJerarquia[nuevoRol?.toLowerCase()];

  if (solicitante._id.toString() === objetivo._id.toString()) {
    return {
      permitido: false,
      mensaje: 'No puedes cambiar tu propio rol.',
    };
  }

  if (jerarquiaSolicitante <= jerarquiaObjetivo) {
    return {
      permitido: false,
      mensaje:
        'No puedes cambiar el rol de un usuario de igual o mayor jerarquía.',
    };
  }

  // 🛑 No se permite asignar un rol superior al del solicitante
  if (jerarquiaNuevoRol > jerarquiaSolicitante) {
    return {
      permitido: false,
      mensaje: 'No puedes asignar un rol superior al tuyo.',
    };
  }

  return { permitido: true };
};
