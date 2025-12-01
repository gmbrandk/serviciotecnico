// services/tiposTrabajo/tiposTrabajoService.js
let _provider = null;
let _proveedorNombre = 'no definido';
let _proveedorTipo = 'desconocido';
let _inicializado = false;

export const inicializarTiposTrabajoService = (provider, nombre, tipo) => {
  if (_inicializado) {
    console.warn('[tiposTrabajoService] Ya inicializado. Ignorando.');
    return;
  }
  _provider = provider;
  _proveedorNombre = nombre;
  _proveedorTipo = tipo;
  _inicializado = true;
};

export const getTiposTrabajoService = () => {
  if (!_inicializado) {
    throw new Error('[tiposTrabajoService] No ha sido inicializado.');
  }

  return {
    listarTiposTrabajo: () => _provider.listarTiposTrabajo(),
    buscarTipoTrabajoPorId: (id) => _provider.buscarTipoTrabajoPorId(id),

    obtenerNombreProveedor: () => _proveedorNombre,
    obtenerTipoProveedor: () => _proveedorTipo,
  };
};
