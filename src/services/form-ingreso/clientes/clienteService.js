// services/clientes/clienteService.js

let _provider = null;
let _proveedorNombre = 'no definido';
let _proveedorTipo = 'desconocido';
let _inicializado = false;

export const inicializarClienteService = (provider, nombre, tipo) => {
  if (_inicializado) return;

  _provider = provider;
  _proveedorNombre = nombre;
  _proveedorTipo = tipo;
  _inicializado = true;

  console.info(`[clienteService] Inicializado con: ${nombre} (${tipo})`);
};

export const getClienteService = () => {
  if (!_inicializado) throw new Error('[clienteService] ❌ No inicializado');

  return {
    // Métodos estandarizados
    buscarCliente: (dni) => _provider.buscarCliente(dni),
    buscarClientePorId: (id) => _provider.buscarClientePorId(id),
    crearCliente: (data) => _provider.crearCliente(data),

    // Info del proveedor
    obtenerNombreProveedor: () => _proveedorNombre,
    obtenerTipoProveedor: () => _proveedorTipo,
  };
};
