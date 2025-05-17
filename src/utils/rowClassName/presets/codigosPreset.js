export const codigosRowPreset = {
  customConditions: [
    {
      condition: (item) => item.estado === 'inactivo',
      className: 'row-disabled',
    },
    {
      condition: (item) => item.usosDisponibles <= 1,
      className: 'row-warning',
    },
  ],
};
