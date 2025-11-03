let _provider = null;
let _proveedorNombre = 'no definido';
let _proveedorTipo = 'desconocido';
let _inicializado = false;

export const inicializarClienteService = (
  provider,
  nombre = 'anónimo',
  tipo = 'desconocido'
) => {
  if (_inicializado) {
    console.warn(
      '[clienteService] Ya fue inicializado, ignorando reinicialización.'
    );
    return;
  }
  _provider = provider;
  _proveedorNombre = nombre;
  _proveedorTipo = tipo;
  _inicializado = true;
};

export const getClienteService = () => {
  if (!_inicializado || !_provider) {
    throw new Error('[clienteService] No ha sido inicializado.');
  }

  return {
    crearCliente: (data) => _provider.crearCliente(data),
    generarEmails: (data) => _provider.generarEmails(data),

    // 🔹 Aunque sea pass-through, mantenemos la interfaz consistente
    buildPayload: (cliente) => ({ ...cliente }),

    obtenerNombreProveedor: () => _proveedorNombre,
    obtenerTipoProveedor: () => _proveedorTipo,
  };
};

export const estaInicializadoClienteService = () => _inicializado;
