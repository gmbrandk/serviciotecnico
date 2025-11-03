import { useEffect } from 'react';
import { useOrdenServicioContext } from '../../context/OrdenServicioContext';
import { buildClienteFields } from '../../forms/clienteFormSchema';
import { useBuscarClientes } from '../../hooks/useBuscarClientes';
import { useClienteForm } from '../../hooks/useClienteForm';
import { SchemaForm } from './SchemaForm';

export function StepCliente() {
  const { orden, handleChangeOrden, resetClienteId } =
    useOrdenServicioContext();
  const cliente = orden.cliente || {};

  const { clientes, fetchClienteById } = useBuscarClientes(cliente?.dni);

  const clienteForm = useClienteForm({
    clienteInicial: cliente,
    handleChangeOrden,
    fetchClienteById,
    resetClienteId,
    clientes,
  });

  const { fields, fieldOrder } = buildClienteFields({
    cliente,
    locked: clienteForm.locked,
    dni: clienteForm.dni,
    email: clienteForm.email,
    navigation: clienteForm.navigation,
  });

  useEffect(() => {
    clienteForm.navigation.setFieldOrder(fieldOrder);
  }, [fieldOrder]);

  return (
    <SchemaForm
      values={cliente}
      onChange={(field, value) =>
        handleChangeOrden('cliente', { [field]: value })
      }
      fields={fields}
      gridTemplateColumns="repeat(3, 1fr)"
      showDescriptions={false}
    />
  );
}
