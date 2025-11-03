let _provider = null;
let _proveedorNombre = 'no definido';
let _proveedorTipo = 'desconocido';
let _inicializado = false;

export const inicializarOrdenServicioService = (
  provider,
  nombre = 'anónimo',
  tipo = 'desconocido'
) => {
  if (_inicializado) {
    console.warn(
      '[ordenServicioService] Ya fue inicializado, ignorando reinicialización.'
    );
    return;
  }
  _provider = provider;
  _proveedorNombre = nombre;
  _proveedorTipo = tipo;
  _inicializado = true;
};

export const getOrdenServicioService = () => {
  if (!_inicializado || !_provider) {
    throw new Error('[ordenServicioService] No ha sido inicializado.');
  }

  return {
    crearOrdenServicio: (payload) => _provider.crearOrdenServicio(payload),
    finalizarOrdenServicio: (ids, orden) =>
      _provider.finalizarOrdenServicio(ids, orden),

    buildPayload: ({ ids, orden, tecnicoId }) => {
      const baseLine = {
        tipoTrabajo: orden.tipoTrabajo,
        descripcion: orden.descripcion,
        precioUnitario: orden.precioUnitario || 0,
        cantidad: orden.cantidad || 1,
      };

      const extraLines = (orden.lineas || [])
        .filter(
          (l) =>
            l && l.tipoTrabajo && l.descripcion?.trim() && l.precioUnitario > 0
        )
        .map((l) => ({
          tipoTrabajo: l.tipoTrabajo,
          descripcion: l.descripcion,
          precioUnitario: l.precioUnitario,
          cantidad: l.cantidad || 1,
        }));

      const lineasServicio =
        extraLines.length > 0
          ? extraLines
          : baseLine.tipoTrabajo
          ? [baseLine]
          : [];

      console.log(
        '[buildPayload] ✅ Enviando',
        lineasServicio.length,
        'líneas de servicio:',
        lineasServicio
      );

      const payload = {
        representanteId: ids.clienteId,
        equipoId: ids.equipoId,
        lineasServicio,
        tecnico: orden.tecnico || tecnicoId,
        total: orden.total || 0,
        fechaIngreso: orden.fechaIngreso || new Date().toISOString(),
        diagnosticoCliente: orden.diagnosticoCliente || '',
        observaciones: orden.observaciones || '',
      };

      console.log('[buildPayload] payload construido:', payload);
      return payload;
    },

    obtenerNombreProveedor: () => _proveedorNombre,
    obtenerTipoProveedor: () => _proveedorTipo,
  };
};

export const estaInicializadoOrdenServicioService = () => _inicializado;
