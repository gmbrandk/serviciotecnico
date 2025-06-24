// No se permite cambiar el estado a uno mismo.
// Tampoco se permite cambiar el estado a usuarios de igual o mayor jerarquía.

const rolesJerarquia = require('../../rolesJerarquia');

module.exports = ({ solicitante, objetivo }) => {
  if (solicitante._id.toString() === objetivo._id.toString()) {
    return {
      permitido: false,
      mensaje: 'No puedes cambiar el estado de tu propia cuenta.',
    };
  }

  const jerarquiaSolicitante = rolesJerarquia[solicitante.role.toLowerCase()];
  const jerarquiaObjetivo = rolesJerarquia[objetivo.role.toLowerCase()];

  if (jerarquiaSolicitante <= jerarquiaObjetivo) {
    return {
      permitido: false,
      mensaje:
        'No puedes cambiar el estado de usuarios de igual o mayor jerarquía.',
    };
  }

  return { permitido: true };
};
