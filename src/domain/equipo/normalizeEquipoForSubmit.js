export function normalizeEquipoForSubmit(equipo) {
  if (!equipo) return null;

  return {
    _id: equipo._id ?? null,
    nroSerie: equipo.nroSerie ?? '',
    tipo: equipo.tipo ?? '',
    marca: equipo.marca ?? '',
    modelo: equipo.modelo ?? '',
    sku: equipo.sku ?? '',
    macAddress: equipo.macAddress ?? '',
    imei: equipo.imei ?? '',
    procesador: equipo.procesador ?? '',
    ram: equipo.ram ?? '',
    almacenamiento: equipo.almacenamiento ?? '',
    gpu: equipo.gpu ?? '',
    isNew: Boolean(equipo.isNew),
  };
}
