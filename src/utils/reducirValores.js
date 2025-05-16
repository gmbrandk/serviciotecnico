// utils/reducirCampoConLimite.js
export const reducirCampoConLimite = ({
  lista,
  identificadorBuscado,
  claveIdentificador = 'codigo',
  claveCantidad = 'usosDisponibles',
  valorLimite = 0,
  actualizarEstado = true,
  clavesEstado = { activo: 'activo', inactivo: 'inactivo' },
}) => {
  return lista.map(item => {
    const idActual = item[claveIdentificador];

    if (idActual === identificadorBuscado && item[claveCantidad] > valorLimite) {
      const nuevaCantidad = item[claveCantidad] - 1;

      return {
        ...item,
        [claveCantidad]: nuevaCantidad,
        ...(actualizarEstado && {
          estado: nuevaCantidad === valorLimite ? clavesEstado.inactivo : clavesEstado.activo,
        }),
      };
    }

    return item;
  });
};
