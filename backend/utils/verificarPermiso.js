// utils/permisos/verificarPermiso.js
const rolesJerarquia = require('./permisos/rolesJerarquia');
const acciones = {
  cambiarRolUsuario: require('./permisos/accionesPermiso/usuario/cambiarRolUsuario'),
  cambiarEstado: require('./permisos/accionesPermiso/usuario/cambiarEstado'),
  editarUsuario: require('./permisos/accionesPermiso/usuario/editarUsuario'),
  eliminar: require('./permisos/accionesPermiso/usuario/eliminarUsuario'),
  generarCodigo: require('./permisos/accionesPermiso/usuario/generarCodigoAcceso'),
  obtenerCodigo: require('./permisos/accionesPermiso/usuario/obtenerCodigoAcceso'),
  obtenerUsuario: require('./permisos/accionesPermiso/usuario/obtenerUsuario'),
  obtenerMovimiento: require('./permisos/accionesPermiso/usuario/obtenerMovimiento'),

  // Clientes (controlados por usuarios)
  'cliente:crear': require('./permisos/accionesPermiso/cliente/crearCliente'),
  'cliente:editar': require('./permisos/accionesPermiso/cliente/editarCliente'),
  'cliente:suspender': require('./permisos/accionesPermiso/cliente/suspenderCliente'),
  'cliente:reactivar': require('./permisos/accionesPermiso/cliente/reactivarCliente'),
  'cliente:baja_definitiva': require('./permisos/accionesPermiso/cliente/bajaDefinitivaCliente'),
  'cliente:calificar': require('./permisos/accionesPermiso/cliente/calificarCliente'),
  'cliente:buscar': require('./permisos/accionesPermiso/cliente/buscarCliente'),

  // Equipos (controlados por usuarios)
  'equipo:crear': require('./permisos/accionesPermiso/equipo/crearEquipo'),
  'equipo:editar': require('./permisos/accionesPermiso/equipo/editarEquipo'),
  'equipo:obtener': require('./permisos/accionesPermiso/equipo/obtenerEquipo'),
  'equipo:cambiarEstado': require('./permisos/accionesPermiso/equipo/cambiarEstadoEquipo'),
  'equipo:buscar': require('./permisos/accionesPermiso/equipo/buscarEquipo'),
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
    console.warn(`[❌ verificarPermiso] Acción "${accion}" no registrada.`);
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
