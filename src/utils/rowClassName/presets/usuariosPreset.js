export const usuariosRowPreset = {
  customConditions: [
    {
      condition: (item) => item.rol === 'admin',
      className: 'row-admin',
    },
    {
      condition: (item) => item.estado === 'suspendido',
      className: 'row-suspendido',
    },
  ],
};
