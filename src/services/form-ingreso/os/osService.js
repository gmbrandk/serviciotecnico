let _provider = null;
let _nombre = 'no definido';
let _tipo = 'desconocido';
let _init = false;

export const inicializarOsService = (provider, nombre, tipo) => {
  if (_init) return;

  _provider = provider;
  _nombre = nombre;
  _tipo = tipo;
  _init = true;

  console.info(`[osService] Inicializado con: ${nombre} (${tipo})`);
};

export const getOsService = () => {
  if (!_init) throw new Error('[osService] ❌ No inicializado');

  return {
    crearOrden: (data) => _provider.crearOrden(data),

    // info del provider
    obtenerNombreProveedor: () => _nombre,
    obtenerTipoProveedor: () => _tipo,
  };
};
