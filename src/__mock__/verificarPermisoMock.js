import { rolesJerarquia } from '@__mock__/rolesJerarquia';
import { normalizedId } from '@utils/formatters';

// Módulo de acciones específicas
const acciones = {
  editar: ({ solicitante, objetivo }) => {
    const esMismoUsuario = normalizedId(solicitante) === normalizedId(objetivo);
    const jerarquiaSolicitante = rolesJerarquia[solicitante.role.toLowerCase()];
    const jerarquiaObjetivo = rolesJerarquia[objetivo.role.toLowerCase()];

    if (esMismoUsuario) {
      return {
        permitido: true,
        mensaje: 'Puedes editar tu propia cuenta.',
      };
    }

    if (jerarquiaSolicitante > jerarquiaObjetivo) {
      return {
        permitido: true,
        mensaje: 'Puedes editar usuarios de menor jerarquía.',
      };
    }

    return {
      permitido: false,
      mensaje: 'No puedes editar a usuarios de igual o mayor jerarquía.',
    };
  },

  softDelete: ({ solicitante, objetivo }) => {
    const esMismoUsuario = normalizedId(solicitante) === normalizedId(objetivo);
    const jerarquiaSolicitante = rolesJerarquia[solicitante.role.toLowerCase()];
    const jerarquiaObjetivo = rolesJerarquia[objetivo.role.toLowerCase()];

    if (esMismoUsuario) {
      return {
        permitido: false,
        mensaje: 'No puedes cambiar el estado de tu propia cuenta.',
      };
    }

    if (jerarquiaSolicitante > jerarquiaObjetivo) {
      return {
        permitido: true,
        mensaje: 'Puedes cambiar el estado de usuarios de menor jerarquía.',
      };
    }

    if (jerarquiaSolicitante === jerarquiaObjetivo) {
      return {
        permitido: false,
        mensaje:
          'No puedes cambiar el estado de usuarios con tu misma jerarquía.',
      };
    }

    return {
      permitido: false,
      mensaje: 'No puedes cambiar el estado de usuarios de mayor jerarquía.',
    };
  },

  cambiarRol: ({ nuevoRol }) => {
    if (!nuevoRol) {
      return {
        permitido: false,
        mensaje: 'Debe especificar un nuevo rol.',
      };
    }
    return {
      permitido: true,
      mensaje: 'Cambio de rol permitido.',
    };
  },
};

/**
 * Verifica si un usuario puede realizar una acción sobre otro.
 * @param {Object} params
 * @param {Object} params.solicitante - Usuario que quiere ejecutar la acción.
 * @param {Object} params.objetivo - Usuario sobre quien se ejecuta la acción.
 * @param {string} params.accion - Tipo de acción (clave de `acciones`).
 * @param {string} [params.nuevoRol] - Rol nuevo en caso de `cambiarRol`.
 * @returns {{ permitido: boolean, mensaje: string }}
 */
export const verificarPermisoMock = ({
  solicitante,
  objetivo,
  accion,
  nuevoRol = null,
}) => {
  if (!acciones[accion]) {
    return {
      permitido: false,
      mensaje: `Acción "${accion}" no reconocida.`,
    };
  }

  const rolSolicitante = solicitante?.role?.toLowerCase?.();
  const rolObjetivo = objetivo?.role?.toLowerCase?.();

  if (!rolesJerarquia[rolSolicitante] || !rolesJerarquia[rolObjetivo]) {
    return {
      permitido: false,
      mensaje: 'Rol no reconocido o jerarquía no definida.',
    };
  }

  return acciones[accion]({ solicitante, objetivo, nuevoRol });
};
