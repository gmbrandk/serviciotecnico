// reducirUsoService.js
export const reducirUso = (codigos, codigoBuscado) => {
  return codigos.map(item => {
    if (item.codigo === codigoBuscado && item.usosDisponibles > 0) {
      const nuevosUsos = item.usosDisponibles - 1;
      return {
        ...item,
        usosDisponibles: nuevosUsos,
        estado: nuevosUsos === 0 ? 'inactivo' : 'activo',
      };
    }
    return item;
  });
};
