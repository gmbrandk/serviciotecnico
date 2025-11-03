// hooks/useOrdenServicioForm.js
import { useFormNavigation } from './subHooks/useFormNavigation';

export function useOrdenServicioForm({ linea, handleChangeLinea }) {
  const navigation = useFormNavigation([]);

  const gridTemplate =
    linea.tipo === 'servicio' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';

  return {
    navigation,
    gridTemplate,
    handleChangeLinea,
  };
}
