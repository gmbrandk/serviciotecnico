// src/components/forms/StepEquipo.jsx
import { useEffect, useMemo } from 'react';
import { useOrdenServicioContext } from '../../context/OrdenServicioContext';
import { buildEquipoFields } from '../../forms/equipoFormSchema';
import { useBuscarEquipos } from '../../hooks/useBuscarEquipos';
import { useEquipoForm } from '../../hooks/useEquipoForm';
import { SchemaForm } from './SchemaForm';

export function StepEquipo() {
  const { orden, handleChangeOrden, resetEquipoId } = useOrdenServicioContext();

  const equipo = orden.equipo || {};
  const { equipos, fetchEquipoById } = useBuscarEquipos(equipo?.nroSerie);

  const equipoForm = useEquipoForm({
    equipoInicial: equipo,
    handleChangeOrden,
    fetchEquipoById,
    resetEquipoId,
    equipos,
  });

  // 🧱 Construir campos con el nuevo esquema declarativo
  const fields = useMemo(
    () =>
      buildEquipoFields({
        equipo,
        locked: equipoForm.locked,
        nroSerie: equipoForm.nroSerie,
        navigation: equipoForm.navigation,
      }),
    [equipo, equipoForm]
  );

  // 🧭 Generar el orden de los campos dinámicamente
  const fieldOrder = useMemo(
    () => (Array.isArray(fields) ? fields.map((f) => f.name) : []),
    [fields]
  );

  // ✅ Sincronizar el orden de navegación
  useEffect(() => {
    equipoForm.navigation.setFieldOrder(fieldOrder);
  }, [fieldOrder, equipoForm.navigation]);

  return (
    <SchemaForm
      values={equipo}
      onChange={(field, value) =>
        handleChangeOrden('equipo', { ...equipo, [field]: value })
      }
      fields={fields}
      gridTemplateColumns="repeat(3, 1fr)"
      showDescriptions={false}
    />
  );
}
