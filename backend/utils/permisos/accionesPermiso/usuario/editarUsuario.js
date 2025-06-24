// Permite que un usuario se edite a sí mismo.
// En otros casos, compara jerarquías.

const rolesJerarquia = require('../../rolesJerarquia');

module.exports = ({ solicitante, objetivo }) => {
  const esAutoedicion = solicitante._id.toString() === objetivo._id.toString();
  if (esAutoedicion) {
    return { permitido: true };
  }

  const rolSolicitante = solicitante.role.toLowerCase();
  const rolObjetivo = objetivo.role.toLowerCase();

  const jerarquiaSolicitante = rolesJerarquia[rolSolicitante];
  const jerarquiaObjetivo = rolesJerarquia[rolObjetivo];

  const sonAdministradoresAmbos =
    rolSolicitante === 'administrador' && rolObjetivo === 'administrador';

  if (jerarquiaSolicitante < jerarquiaObjetivo) {
    return {
      permitido: false,
      mensaje: 'No puedes editar a un usuario de mayor jerarquía.',
    };
  }

  if (jerarquiaSolicitante === jerarquiaObjetivo && !sonAdministradoresAmbos) {
    return {
      permitido: false,
      mensaje: 'No puedes editar a un usuario de igual jerarquía.',
    };
  }

  return { permitido: true };
};
