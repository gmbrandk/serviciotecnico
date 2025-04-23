const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'utils', 'permisos');
const accionesDir = path.join(baseDir, 'acciones');

const archivos = [
  {
    path: path.join(baseDir, 'rolesJerarquia.js'),
    content: `module.exports = {
  'superadministrador': 1,
  'administrador': 2,
  'tecnico': 3
};`
  },
  {
    path: path.join(accionesDir, 'cambiarRol.js'),
    content: `const rolesJerarquia = require('../rolesJerarquia');

module.exports = ({ solicitante, objetivo, nuevoRol }) => {
  const rolSolicitante = solicitante.role.toLowerCase();
  const nuevoRolLower = nuevoRol?.toLowerCase();
  const jerarquiaSolicitante = rolesJerarquia[rolSolicitante];
  const jerarquiaNuevoRol = rolesJerarquia[nuevoRolLower];

  if (!jerarquiaNuevoRol) return { permitido: false, mensaje: 'Rol no válido.' };
  if (jerarquiaNuevoRol < jerarquiaSolicitante) return { permitido: false, mensaje: 'No puedes asignar un rol superior al tuyo.' };
  if (solicitante.id === objetivo.id && jerarquiaNuevoRol < jerarquiaSolicitante)
    return { permitido: false, mensaje: 'No puedes aumentarte tu propio rol.' };
  if (solicitante.id === objetivo.id && rolSolicitante === 'superadministrador' && nuevoRolLower !== 'superadministrador')
    return { permitido: false, mensaje: 'El superadministrador no puede bajarse de rango.' };

  return { permitido: true };
};`
  },
  {
    path: path.join(accionesDir, 'editarUsuario.js'),
    content: `module.exports = () => {
  return { permitido: true };
};`
  },
  {
    path: path.join(accionesDir, 'eliminarUsuario.js'),
    content: `module.exports = ({ solicitante, objetivo }) => {
  if (solicitante.id === objetivo.id) {
    return { permitido: false, mensaje: 'No puedes eliminar tu propia cuenta.' };
  }
  return { permitido: true };
};`
  },
  {
    path: path.join(baseDir, 'verificarPermiso.js'),
    content: `const rolesJerarquia = require('./rolesJerarquia');
const acciones = {
  cambiarRol: require('./acciones/cambiarRol'),
  editar: require('./acciones/editarUsuario'),
  eliminar: require('./acciones/eliminarUsuario')
};

const verificarPermiso = ({ solicitante, objetivo, accion, nuevoRol = null }) => {
  const rolSolicitante = solicitante.role.toLowerCase();
  const rolObjetivo = objetivo.role.toLowerCase();
  const jerarquiaSolicitante = rolesJerarquia[rolSolicitante];
  const jerarquiaObjetivo = rolesJerarquia[rolObjetivo];

  if (!acciones[accion]) return { permitido: false, mensaje: 'Acción no válida.' };
  if (jerarquiaSolicitante > 2) return { permitido: false, mensaje: 'No tienes permisos para realizar esta acción.' };
  if (jerarquiaSolicitante >= jerarquiaObjetivo) return { permitido: false, mensaje: 'No puedes modificar a usuarios de igual o mayor jerarquía.' };

  return acciones[accion]({ solicitante, objetivo, nuevoRol });
};

module.exports = verificarPermiso;`
  }
];

const crearArchivos = () => {
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
  if (!fs.existsSync(accionesDir)) fs.mkdirSync(accionesDir);

  archivos.forEach(({ path, content }) => {
    fs.writeFileSync(path, content, 'utf8');
    console.log(`✅ Archivo creado: ${path}`);
  });

  console.log('\n✅ Estructura de permisos SRP creada correctamente.\n');
};

crearArchivos();
