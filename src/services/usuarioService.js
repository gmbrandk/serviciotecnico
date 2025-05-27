// usuarioService.js
let provider;
let proveedorNombre = 'no definido';
let proveedorTipo = 'desconocido'; // 'mock' | 'api' | etc.

export const inicializarUsuarioService = (
  nuevoProvider,
  nombre = 'anónimo',
  tipo = 'desconocido'
) => {
  provider = nuevoProvider;
  proveedorNombre = nombre;
  proveedorTipo = tipo;
};

export const obtenerUsuarios = async () => {
  if (!provider) throw new Error('Proveedor no inicializado');
  return provider.obtenerUsuarios();
};

export const toggleActivo = async (id) => {
  if (!provider) throw new Error('Proveedor no inicializado');
  return provider.toggleActivo(id);
};

export const obtenerNombreProveedor = () => proveedorNombre;
export const obtenerTipoProveedor = () => proveedorTipo;
