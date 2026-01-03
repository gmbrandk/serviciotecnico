// utils/form-ingreso/buildIngresoInitialState.js
import { snapshotWizardPayload } from './snapshotWizard';

export function buildIngresoInitialState({
  mode, // 'wizard' | 'panel'
  payloadFromWizard = null,
  ordenServicioUuid,
}) {
  if (!ordenServicioUuid) {
    throw new Error('ordenServicioUuid es obligatorio');
  }

  // 🧱 Shape base REAL (alineado con backend)
  const baseState = {
    mode,
    ordenServicioUuid,
    representanteId: null,
    equipoId: null,
    tecnico: null,
    lineasServicio: [],
    total: 0,
    fechaIngreso: new Date().toISOString(),
    diagnosticoCliente: '',
    observaciones: '',
  };

  // 🧭 Wizard → adaptar sobre el mismo shape
  if (mode === 'wizard' && payloadFromWizard) {
    return snapshotWizardPayload({
      mode,
      baseState,
      payloadFromWizard,
    });
  }

  return baseState;
}
