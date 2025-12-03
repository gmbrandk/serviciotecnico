export function createLineaServicio() {
  return {
    _uid: crypto.randomUUID(),
    tipo: 'servicio', // 👈 Valor por defecto
    tipoTrabajo: '',
    descripcion: '',
    cantidad: 1,
    precioUnitario: 0,
    subTotal: 0,
  };
}
