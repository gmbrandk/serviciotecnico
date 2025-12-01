export function normalizeOrdenPayload(backendData) {
  return {
    representanteId: backendData.representanteId ?? null,
    equipoId: backendData.equipoId ?? null,
    tecnico: backendData.tecnico ?? null,

    orden: {
      diagnosticoCliente: backendData.diagnosticoCliente || '',
      observaciones: backendData.observaciones || '',
      fechaIngreso: backendData.fechaIngreso,
      total: backendData.total || 0,

      lineasServicio:
        backendData.lineasServicio?.map((l) => ({
          tipoTrabajo: l.tipoTrabajo, // ID → OK
          descripcion: l.descripcion,
          precioUnitario: l.precioUnitario,
          cantidad: l.cantidad,
        })) ?? [],
    },
  };
}
