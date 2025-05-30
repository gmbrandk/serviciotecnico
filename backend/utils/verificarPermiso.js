// utils/permisos/verificarPermiso.js
const rolesJerarquia = require('./permisos/rolesJerarquia');
const acciones = {
  cambiarRol: require('./permisos/accionesPermiso/cambiarRol'),
  editar: require('./permisos/accionesPermiso/editarUsuario'),
  eliminar: require('./permisos/accionesPermiso/eliminarUsuario'),
  cambiarEstado: require('./permisos/accionesPermiso/cambiarEstado'),
  generarCodigo: require('./permisos/accionesPermiso/generarCodigoAcceso'),
};

const verificarPermiso = ({
  solicitante,
  objetivo,
  accion,
  nuevoRol = null,
}) => {
  const rolSolicitante = solicitante.role?.toLowerCase?.();
  const rolObjetivo = objetivo?.role?.toLowerCase?.();

  const jerarquiaSolicitante = rolesJerarquia[rolSolicitante];
  const jerarquiaObjetivo = rolObjetivo ? rolesJerarquia[rolObjetivo] : -1;

  if (!acciones[accion]) {
    return { permitido: false, mensaje: 'Acción no válida.' };
  }

  if (jerarquiaSolicitante === undefined) {
    return {
      permitido: false,
      mensaje: 'Rol del solicitante no reconocido.',
    };
  }

  // Delegamos completamente a la acción individual
  return acciones[accion]({
    solicitante,
    objetivo,
    nuevoRol,
    jerarquiaSolicitante,
    jerarquiaObjetivo,
  });
};

module.exports = verificarPermiso;
