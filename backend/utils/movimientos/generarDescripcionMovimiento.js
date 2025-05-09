// utils/generarDescripcionMovimiento.js
function generarDescripcionMovimiento(movimiento) {
    const { tipo, realizadoPor, usadoPor, entidad, entidadId } = movimiento;
  
    const creador = realizadoPor?.nombre || 'alguien';
    const usuario = usadoPor?.nombre || 'un usuario';
  
    // Mapeo de entidades a nombres legibles
    const entidadesLegibles = {
      'CodigoAcceso': 'código de acceso',
      'Usuario': 'usuario',
      // Puedes agregar otras entidades aquí si es necesario
    };
  
    const entidadLegible = entidadesLegibles[entidad] || entidad.toLowerCase();
  
    switch (tipo) {
      case 'crear':
        return `Se creó un ${entidadLegible} por ${creador}.`;
      case 'uso_codigo':
        return `${usuario} usó el ${entidadLegible} creado por ${creador}.`;
      case 'eliminar':
        return `${creador} eliminó el ${entidadLegible}.`;
      default:
        return movimiento.descripcion || 'Acción registrada.';
    }
  }
  
module.exports = generarDescripcionMovimiento;
  