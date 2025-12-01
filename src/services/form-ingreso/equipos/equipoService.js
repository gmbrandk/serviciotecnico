// services/equipos/equiposService.js

let _provider = null;
let _proveedorNombre = 'no definido';
let _proveedorTipo = 'desconocido';
let _inicializado = false;

export const inicializarEquiposService = (provider, nombre, tipo) => {
  if (_inicializado) return;

  _provider = provider;
  _proveedorNombre = nombre;
  _proveedorTipo = tipo;
  _inicializado = true;

  console.info(`[equiposService] Inicializado con: ${nombre} (${tipo})`);
};

export const getEquiposService = () => {
  if (!_inicializado) throw new Error('[equiposService] ❌ No inicializado');

  return {
    // Métodos estandarizados
    buscarEquipo: (query) => _provider.buscarEquipo(query),
    buscarEquipoPorId: (id) => _provider.buscarEquipoPorId(id),

    // Info del proveedor
    obtenerNombreProveedor: () => _proveedorNombre,
    obtenerTipoProveedor: () => _proveedorTipo,
  };
};
