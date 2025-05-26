// Permite que un usuario se edite a sí mismo.
// En otros casos, compara jerarquías.

const rolesJerarquia = require('../rolesJerarquia');

module.exports = ({ solicitante, objetivo }) => {
  if (solicitante._id.toString() === objetivo._id.toString()) {
    // ✅ Autoedición permitida
    return { permitido: true };
  }

  const jerarquiaSolicitante = rolesJerarquia[solicitante.role.toLowerCase()];
  const jerarquiaObjetivo = rolesJerarquia[objetivo.role.toLowerCase()];

  if (jerarquiaSolicitante <= jerarquiaObjetivo) {
    // ❌ No se permite editar a iguales o superiores
    return {
      permitido: false,
      mensaje: 'No puedes editar a usuarios de igual o mayor jerarquía.',
    };
  }

  return { permitido: true };
};
