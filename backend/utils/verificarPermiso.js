const rolesJerarquia = require('./permisos/rolesJerarquia');
const acciones = {
  cambiarRol: require('./permisos/accionesPermiso/cambiarRol'),
  editar: require('./permisos/accionesPermiso/editar'),
  eliminar: require('./permisos/accionesPermiso/eliminarUsuario')
};

const verificarPermiso = ({ solicitante, objetivo, accion, nuevoRol = null }) => {
  const rolSolicitante = solicitante.role?.toLowerCase?.();
  const rolObjetivo = objetivo.role?.toLowerCase?.();

  const jerarquiaSolicitante = rolesJerarquia[rolSolicitante];
  const jerarquiaObjetivo = rolesJerarquia[rolObjetivo];

  // Acción no reconocida
  if (!acciones[accion]) {
    return { permitido: false, mensaje: 'Acción no válida.' };
  }

  // Roles inválidos o jerarquía no definida
  if (
    jerarquiaSolicitante === undefined ||
    jerarquiaObjetivo === undefined
  ) {
    return { permitido: false, mensaje: 'Rol no reconocido o jerarquía no definida.' };
  }

  // No se permite modificar a usuarios de igual o mayor jerarquía
  if (jerarquiaSolicitante <= jerarquiaObjetivo) {
    return {
      permitido: false,
      mensaje: 'No puedes modificar a usuarios de igual o mayor jerarquía.'
    };
  }

  // Ejecutar lógica personalizada de la acción
  return acciones[accion]({ solicitante, objetivo, nuevoRol });
};

module.exports = verificarPermiso;
