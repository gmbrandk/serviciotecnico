import { showToast } from '@services/toast/toastService';
import { useMemo } from 'react';
import { getSteps } from '../config/stepsConfig';
import { useOrdenServicioContext } from '../context/OrdenServicioContext';
import { useOrdenServicioWizard } from '../hooks/useOrdenServicioWizard';
import { StepWizardCore } from './StepWizardCore';

export function OrdenServicioWizard({ tecnicoId }) {
  const { orden } = useOrdenServicioContext();

  // 🧩 Pasamos los callbacks de feedback al hook
  const { handleStepSubmit, handleFinalSubmit } = useOrdenServicioWizard({
    tecnicoId,
    onError: (msg) => showToast('error', msg),
    onSuccess: (msg) => showToast('success', msg),
  });

  const steps = useMemo(() => {
    console.groupCollapsed(
      '%c[Wizard] ♻️ Recalculando steps...',
      'color:#3498db'
    );
    const newSteps = getSteps(orden);
    console.table(newSteps.map((s, i) => ({ i, id: s.id, title: s.title })));
    console.groupEnd();
    return newSteps;
  }, [orden.lineas?.length, orden.equipo?.especificaciones]);

  return (
    <StepWizardCore
      steps={steps}
      onStepSubmit={(currentStep) => handleStepSubmit(currentStep, orden)}
      onFinalSubmit={() => handleFinalSubmit(orden)}
      getNextLabel={(currentStep) => {
        if (currentStep.id === 'cliente') {
          return orden?.cliente?._id ? 'Siguiente' : 'Crear Cliente';
        }
        if (currentStep.id === 'equipo') {
          if (!orden?.equipo?._id) {
            return orden?.equipo?.especificaciones ? 'Agregar' : 'Crear Equipo';
          }
          return orden?.equipo?.especificaciones
            ? 'Agregar especificaciones'
            : 'Siguiente';
        }
        if (currentStep.id === 'ficha-tecnica') {
          return 'Registrar Equipo';
        }
        return 'Siguiente';
      }}
      getSubmitLabel={() => 'Finalizar Orden'}
    />
  );
}
