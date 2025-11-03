// config/getSteps.js
import { StepCliente } from '../components/forms/StepCliente';
import { StepEquipo } from '../components/forms/StepEquipo';
import { StepFichaTecnica } from '../components/forms/StepFichaTecnica';
import { StepLineaServicio } from '../components/forms/StepLineaServicio';
import { StepOrdenServicio } from '../components/forms/StepOrdenServicio';

export const getSteps = (orden) => {
  console.log(
    '[getSteps] 🧩 Generando pasos con orden.lineas:',
    orden.lineas?.length
  );

  // 🧱 Pasos base fijos del flujo
  const baseSteps = [
    {
      id: 'cliente',
      title: 'Crear Cliente',
      subtitle: 'Ingresa datos de cliente',
      Component: StepCliente,
    },
    {
      id: 'equipo',
      title: 'Crear Equipo',
      subtitle: 'Ingresa datos de equipo',
      Component: StepEquipo,
    },
    {
      id: 'ficha-tecnica',
      title: 'Ficha Técnica',
      subtitle: 'Detalles del hardware',
      Component: StepFichaTecnica,
      hidden: !orden?.equipo?.especificaciones,
    },
    {
      id: 'orden-servicio',
      title: 'Crear OS',
      subtitle: 'Ingresa tipo de Servicio',
      Component: StepOrdenServicio,
    },
  ];

  // ⚙️ Generar steps solo para las líneas adicionales (desde la segunda)
  const lineSteps = (orden?.lineas || []).slice(1).map((linea, idx) => {
    const numero = idx + 2; // Línea #2, #3, etc.
    console.log(`[getSteps] ➕ Agregando paso linea-${numero}`);
    return {
      id: `linea-${numero - 1}`,
      title: `Línea de servicio #${numero}`,
      subtitle: 'Ingresa un nuevo servicio',
      Component: StepLineaServicio,
      props: { index: idx + 1 }, // importante: apunta al índice real en orden.lineas
    };
  });
  console.table([...baseSteps, ...lineSteps].map((s) => s.id));

  // 🔚 Diagnóstico antes de devolver el array final
  if (window.DEBUG_WIZARD) {
    console.groupCollapsed(
      '%c[DIAG 🧱 getSteps]',
      'color:#e67e22;font-weight:bold'
    );
    console.log('🧩 lineas:', orden.lineas?.length);
    console.table(
      [...baseSteps, ...lineSteps].map((s, i) => ({
        idx: i,
        id: s.id,
        title: s.title,
      }))
    );
    console.groupEnd();
  }
  // 🔚 Resultado final
  return [...baseSteps, ...lineSteps];
};
