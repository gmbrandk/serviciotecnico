// @utils/tabla/crearRenderAcciones.js
import { reducirCampoConLimite } from '@utils/reducirValores';

/**
 * Crea un renderizador de acciones para una tabla que reduce un valor numérico.
 */
export const crearRenderAcciones = ({
  claveId = '_id',
  claveCantidad = 'usosDisponibles',
  claveEstado = 'estado',
  valoresEstado = { activo: 'activo', inactivo: 'inactivo' },
  valorLimite = 0,
  onUpdate,
}) => {
  return (item) => {
    const handleReducir = () => {
      onUpdate((prev) =>
        reducirCampoConLimite({
          lista: prev,
          identificadorBuscado: item[claveId],
          claveIdentificador: claveId,
          claveCantidad,
          valorLimite,
          actualizarEstado: true,
          clavesEstado: valoresEstado,
        })
      );
    };

    return (
      <button onClick={handleReducir}>
        ➖ Usos
      </button>
    );
  };
};
