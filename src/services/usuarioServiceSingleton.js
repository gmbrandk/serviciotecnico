// @services/usuarioServiceSingleton.js

let _provider = null;
let _proveedorNombre = 'no definido';
let _proveedorTipo = 'desconocido'; // Ej: 'mock' | 'api' | 'local'

let _inicializado = false;

// ✅ Inicializar con un provider específico
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

// ✅ Obtener instancia única
export const getUsuarioService = () => {
  if (!_inicializado || !_provider) {
    throw new Error(
      '[usuarioService] No ha sido inicializado. Usa inicializarUsuarioService() antes de llamar getUsuarioService().'
    );
  }

  return {
    obtenerUsuarios: () => _provider.obtenerUsuarios(),
    editarUsuario: (id, data) => _provider.editarUsuario(id, data),
    toggleActivo: (id) => _provider.toggleActivo(id),
    obtenerNombreProveedor: () => _proveedorNombre,
    obtenerTipoProveedor: () => _proveedorTipo,
  };
};

// ✅ Utilidad para saber si ya está listo
export const estaInicializadoUsuarioService = () => _inicializado;
