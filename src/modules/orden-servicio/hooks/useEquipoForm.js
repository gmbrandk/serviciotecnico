import { useFormNavigation } from './subHooks/useFormNavigation';
import { useNroSerieAutocomplete } from './subHooks/useNroSerieAutocomplete';

export function useEquipoForm({
  equipoInicial,
  handleChangeOrden,
  fetchEquipoById,
  resetEquipoId,
  equipos,
}) {
  const navigation = useFormNavigation([]);

  const nroSerie = useNroSerieAutocomplete({
    equipoInicial,
    equipos,
    fetchEquipoById,
    resetEquipoId,
    handleChangeOrden,
    focusNextField: navigation.focusNextField,
  });

  const locked = Boolean(equipoInicial?._id);

  return {
    nroSerie,
    navigation,
    locked,
    handleChangeOrden,
  };
}
