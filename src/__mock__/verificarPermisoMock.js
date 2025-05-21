import { rolesJerarquia } from '@__mock__/rolesJerarquia';

const acciones = {
  eliminarUsuario: ({ solicitante, objetivo }) => {
    // Simulación básica, en el backend puedes tener más lógica
    return { permitido: true, mensaje: 'Eliminación permitida (mock).' };
  },
  editar: () => ({ permitido: true }),
  cambiarRol: () => ({ permitido: true })
};

export const verificarPermisoMock = ({ solicitante, objetivo, accion, nuevoRol = null }) => {
  const rolSolicitante = solicitante.role?.toLowerCase?.();
  const rolObjetivo = objetivo.role?.toLowerCase?.();

  const jerarquiaSolicitante = rolesJerarquia[rolSolicitante];
  const jerarquiaObjetivo = rolesJerarquia[rolObjetivo];

  if (!acciones[accion]) {
    return { permitido: false, mensaje: 'Acción no válida.' };
  }

  if (
    jerarquiaSolicitante === undefined ||
    jerarquiaObjetivo === undefined
  ) {
    return {
      permitido: false,
      mensaje: 'Rol no reconocido o jerarquía no definida.'
    };
  }

  if (jerarquiaSolicitante <= jerarquiaObjetivo) {
    return {
      permitido: false,
      mensaje: 'No puedes modificar a usuarios de igual o mayor jerarquía.'
    };
  }

  return acciones[accion]({ solicitante, objetivo, nuevoRol });
};
