import { rolesJerarquia } from '@__mock__/rolesJerarquia';

// Módulo de acciones específicas
const acciones = {
  eliminarUsuario: ({ solicitante, objetivo }) => ({
    permitido: true,
    mensaje: 'Eliminación permitida (mock).',
  }),

  editar: () => ({
    permitido: true,
    mensaje: 'Edición permitida.',
  }),

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
  const rolSolicitante = solicitante?.role?.toLowerCase?.();
  const rolObjetivo = objetivo?.role?.toLowerCase?.();

  const jerarquiaSolicitante = rolesJerarquia[rolSolicitante];
  const jerarquiaObjetivo = rolesJerarquia[rolObjetivo];

  if (!acciones[accion]) {
    return {
      permitido: false,
      mensaje: `Acción "${accion}" no reconocida.`,
    };
  }

  if (jerarquiaSolicitante === undefined || jerarquiaObjetivo === undefined) {
    return {
      permitido: false,
      mensaje: 'Rol no reconocido o jerarquía no definida.',
    };
  }

  if (jerarquiaSolicitante <= jerarquiaObjetivo) {
    return {
      permitido: false,
      mensaje: 'No puedes modificar a usuarios de igual o mayor jerarquía.',
    };
  }

  return acciones[accion]({ solicitante, objetivo, nuevoRol });
};
