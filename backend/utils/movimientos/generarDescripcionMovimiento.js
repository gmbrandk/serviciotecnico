// utils/generarDescripcionMovimiento.js
function generarDescripcionMovimiento(movimiento) {
  const { tipo, realizadoPor, usadoPor, entidad, descripcion } = movimiento;

  // Si hay descripción personalizada, úsala directamente
  if (descripcion && descripcion.trim() !== '') {
    return descripcion;
  }

  const creador = realizadoPor?.nombre || 'alguien';
  const usuario = usadoPor?.nombre || 'un usuario';

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
      return 'Acción registrada.';
  }
}

module.exports = generarDescripcionMovimiento;
