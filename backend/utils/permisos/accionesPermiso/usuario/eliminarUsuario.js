// No se permite eliminar a uno mismo.
// Además, se impide eliminar usuarios de igual o mayor jerarquía.

const rolesJerarquia = require('../../rolesJerarquia');

module.exports = ({ solicitante, objetivo }) => {
  if (solicitante._id.toString() === objetivo._id.toString()) {
    return {
      permitido: false,
      mensaje: 'No puedes eliminar tu propia cuenta.',
    };
  }

  const jerarquiaSolicitante = rolesJerarquia[solicitante.role.toLowerCase()];
  const jerarquiaObjetivo = rolesJerarquia[objetivo.role.toLowerCase()];

  if (jerarquiaSolicitante <= jerarquiaObjetivo) {
    return {
      permitido: false,
      mensaje: 'No puedes eliminar a usuarios de igual o mayor jerarquía.',
    };
  }

  return { permitido: true };
};
