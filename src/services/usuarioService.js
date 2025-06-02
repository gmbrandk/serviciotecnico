let _provider = null;
let _proveedorNombre = 'no definido';
let _proveedorTipo = 'desconocido';

let _inicializado = false;

export const inicializarUsuarioService = (
  provider,
  nombre = 'anónimo',
  tipo = 'desconocido'
) => {
  if (_inicializado) {
    console.warn(
      '[usuarioService] Ya fue inicializado. Ignorando reinicialización.'
    );
    return;
  }

  _provider = provider;
  _proveedorNombre = nombre;
  _proveedorTipo = tipo;
  _inicializado = true;
};

export const getUsuarioService = () => {
  if (!_inicializado || !_provider) {
    throw new Error('[usuarioService] No ha sido inicializado.');
  }

  return {
    obtenerUsuarios: () => _provider.obtenerUsuarios(),
    editarUsuario: (id, data) => _provider.editarUsuario(id, data),
    cambiarRolUsuario: (id, nuevoRol, contrasenaConfirmacion) =>
      _provider.cambiarRolUsuario(id, nuevoRol, contrasenaConfirmacion),
    reset: () => _provider.reset?.(),
    toggleActivo: (id) => _provider.toggleActivo(id),
    obtenerNombreProveedor: () => _proveedorNombre,
    obtenerTipoProveedor: () => _proveedorTipo,
    cambiarPasswordUsuario: (id, datos) =>
      _provider.cambiarPasswordUsuario(id, datos),
  };
};

export const estaInicializadoUsuarioService = () => _inicializado;
