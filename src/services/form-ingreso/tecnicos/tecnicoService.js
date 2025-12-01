// services/tecnicos/tecnicosService.js

let _provider = null;
let _proveedorNombre = 'no definido';
let _proveedorTipo = 'desconocido';
let _inicializado = false;

export const inicializarTecnicosService = (provider, nombre, tipo) => {
  if (_inicializado) return;

  _provider = provider;
  _proveedorNombre = nombre;
  _proveedorTipo = tipo;
  _inicializado = true;

  console.info(`[tecnicosService] Inicializado con: ${nombre} (${tipo})`);
};

export const getTecnicosService = () => {
  if (!_inicializado) throw new Error('[tecnicosService] ❌ No inicializado');

  return {
    // 🔥 API consistente con el Context
    buscarTecnicos: (query) => _provider.buscarTecnico(query),
    buscarTecnicoPorId: (id) => {
      const realId = typeof id === 'string' ? id : id?._id;

      if (!realId) {
        console.error(
          '[tecnicosService] ❌ buscarTecnicoPorId recibió un ID inválido:',
          id
        );
        return null;
      }

      return _provider.buscarTecnicoPorId(realId);
    },

    // Info del proveedor
    obtenerNombreProveedor: () => _proveedorNombre,
    obtenerTipoProveedor: () => _proveedorTipo,
  };
};
