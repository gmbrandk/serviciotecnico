// useClienteForm.js
import { useState } from 'react';
import { useEmailSuggestions } from './subHooks/emailSuggestions';
import { useDniAutocomplete } from './subHooks/useDniAutocomplete';
import { useFormNavigation } from './subHooks/useFormNavigation';

export function useClienteForm({
  clienteInicial,
  handleChangeOrden,
  fetchClienteById,
  resetClienteId,
  clientes,
}) {
  const [paisSeleccionado, setPaisSeleccionado] = useState(null);

  // ✅ ahora soporta getFieldValue y getContext
  const navigation = useFormNavigation(
    [], // initialOrder (se sincroniza luego)
    (field) => clienteInicial?.[field] || '',
    () => ({ paisSeleccionado })
  );

  const dni = useDniAutocomplete({
    clienteInicial,
    clientes,
    fetchClienteById,
    resetClienteId,
    handleChangeOrden,
    focusNextField: navigation.focusNextField,
  });

  const email = useEmailSuggestions({
    clienteInicial,
    handleChangeOrden,
    focusNextField: navigation.focusNextField,
  });

  const locked = Boolean(clienteInicial?._id);

  return {
    dni,
    email,
    navigation,
    paisSeleccionado,
    setPaisSeleccionado,
    locked,
    handleChangeOrden,
  };
}
