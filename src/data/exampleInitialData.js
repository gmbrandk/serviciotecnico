// exampleInitialData.js
// ✅ Mock completo de una Orden de Servicio existente — listo para editar

export const exampleInitialData = {
  representanteId: 'c1', // → cliente id
  equipoId: 'eq1', // → equipo id

  lineasServicio: [
    {
      tipoTrabajo: '68afd6a2c19b8c72a13decb0', // diagnóstico técnico integral
      descripcion: 'Equipo no enciende',
      precioUnitario: 30,
      cantidad: 1,
    },
    {
      tipoTrabajo: '68dc9ac76162927555649baa', // formateo SO
      descripcion: 'Windows no inicia correctamente',
      precioUnitario: 40,
      cantidad: 1,
    },
  ],

  tecnico: 't2', // técnico asignado (María Salazar)

  total: 70,
  fechaIngreso: '2025-11-11T03:52:20.088Z',

  diagnosticoCliente: 'Cliente indica que el equipo se apaga solo.',
  observaciones: 'Equipo presenta golpes en la carcasa.',
};
