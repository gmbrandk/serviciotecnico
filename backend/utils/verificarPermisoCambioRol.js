const rolesJerarquia = {
    'superadministrador': 1,
    'administrador': 2,
    'tecnico': 3
  };
  
  const verificarPermisoCambioRol = ({ solicitante, objetivo, nuevoRol }) => {
    const rolSolicitante = solicitante.role.toLowerCase();
    const rolObjetivo = objetivo.role.toLowerCase();
    const nuevoRolLower = nuevoRol.toLowerCase();
  
    if (!rolesJerarquia[nuevoRolLower]) {
      return { permitido: false, mensaje: 'Rol no válido.' };
    }
  
    const jerarquiaSolicitante = rolesJerarquia[rolSolicitante];
    const jerarquiaObjetivo = rolesJerarquia[rolObjetivo];
    const jerarquiaNuevoRol = rolesJerarquia[nuevoRolLower];
  
    if (jerarquiaSolicitante > 2) {
      return { permitido: false, mensaje: 'No tienes permisos para realizar esta acción.' };
    }
  
    if (jerarquiaSolicitante >= jerarquiaObjetivo) {
      return { permitido: false, mensaje: 'No puedes modificar a usuarios de igual o mayor jerarquía.' };
    }
  
    if (jerarquiaNuevoRol < jerarquiaSolicitante) {
      return { permitido: false, mensaje: 'No puedes asignar un rol superior al tuyo.' };
    }
  
    if (solicitante.id === objetivo.id && jerarquiaNuevoRol < jerarquiaSolicitante) {
      return { permitido: false, mensaje: 'No puedes aumentarte tu propio rol.' };
    }
  
    if (solicitante.id === objetivo.id && rolSolicitante === 'superadministrador' && nuevoRolLower !== 'superadministrador') {
      return { permitido: false, mensaje: 'El superadministrador no puede bajarse de rango.' };
    }
  
    return { permitido: true };
  };
  
  module.exports = verificarPermisoCambioRol;
  