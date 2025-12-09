// ✅ src/hooks/useOrdenServicioWizard.js
import { useCliente } from '@context/cliente/ClienteContext';
import { useEquipo } from '@context/equipo/EquipoContext';
import { useOSApi } from '@context/ordenServicio/OrdenServicioApiContext';
import { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';

const initialIds = { clienteId: null, equipoId: null, ordenId: null };

function idsReducer(state, action) {
  switch (action.type) {
    case 'SET_CLIENTE':
      return { clienteId: action.payload, equipoId: null, ordenId: null };
    case 'SET_EQUIPO':
      if (!state.clienteId) return state;
      return { ...state, equipoId: action.payload, ordenId: null };
    case 'SET_ORDEN':
      if (!state.clienteId || !state.equipoId) return state;
      return { ...state, ordenId: action.payload };
    case 'RESET_CLIENTE':
    case 'RESET_ALL':
      return initialIds;
    default:
      return state;
  }
}

const logger = {
  log: (...args) =>
    process.env.NODE_ENV === 'development' && console.log(...args),
  error: (...args) => console.error(...args),
};

export function useOrdenServicioWizard({ tecnicoId, onError, onSuccess } = {}) {
  const [ids, dispatch] = useReducer(idsReducer, initialIds);
  const navigate = useNavigate();

  // ✅ Contextos
  const { crearCliente } = useCliente();
  const { crearEquipo } = useEquipo();
  const { buildPayload } = useOSApi();

  const validateIds = (required = []) => {
    for (const key of required) {
      if (!ids[key]) {
        const msg = `Debe completar ${key} antes de continuar.`;
        logger.error(msg);
        return { success: false, message: msg };
      }
    }
    return { success: true };
  };

  const resetClienteId = () => dispatch({ type: 'RESET_CLIENTE' });

  // ✅ Crear equipo usando context
  const crearEquipoWizard = async (equipoData, extra = {}) => {
    const res = await crearEquipo({
      ...equipoData,
      clienteActual: ids.clienteId,
      ...extra,
    });

    if (res.success && res.details?.equipo?._id) {
      const id = res.details.equipo._id;
      dispatch({ type: 'SET_EQUIPO', payload: id });
      onSuccess?.('Equipo creado con éxito.');
      return { success: true };
    }

    onError?.(res.message);
    return res;
  };

  const handleStepSubmit = async (currentStep, orden) => {
    const data = orden[currentStep.id] || {};

    // === CLIENTE ===
    if (currentStep.id === 'cliente') {
      const id = data?._id;

      if (id) {
        dispatch({ type: 'SET_CLIENTE', payload: id });
        onSuccess?.('Cliente seleccionado.');
        return { success: true };
      }

      const res = await crearCliente(data);
      if (res.success && res.details?.cliente?._id) {
        dispatch({ type: 'SET_CLIENTE', payload: res.details.cliente._id });
        onSuccess?.('Cliente creado.');
        return { success: true };
      }
      onError?.(res.message);
      return res;
    }

    // === EQUIPO ===
    if (currentStep.id === 'equipo') {
      const check = validateIds(['clienteId']);
      if (!check.success) return check;

      // ✅ FIX IMPORTANTE:
      // Si se marcó "Agregar especificaciones", NO crear equipo aún.
      if (orden.equipo?.especificaciones === true) {
        logger.log('📌 Avanzando sin crear equipo (modo ficha técnica).');
        return { success: true };
      }

      // ✅ Equipo existente
      if (orden.equipo?._id) {
        dispatch({ type: 'SET_EQUIPO', payload: orden.equipo._id });
        return { success: true };
      }

      // ✅ Crear equipo normalmente (sin ficha técnica)
      return crearEquipoWizard(orden.equipo);
    }

    // === FICHA TÉCNICA ===
    if (currentStep.id === 'ficha-tecnica') {
      const check = validateIds(['clienteId']);
      if (!check.success) return check;

      // ✅ Aquí se crea el equipo con toda la data final
      return crearEquipoWizard(orden.equipo, {
        fichaTecnicaManual: orden.fichaTecnica,
      });
    }

    return { success: true };
  };

  // ✅ Submit final
  const handleFinalSubmit = async (orden) => {
    const check = validateIds(['clienteId', 'equipoId']);
    if (!check.success) return check;

    const payload = buildPayload({ ids, orden, tecnicoId });

    navigate('/dashboard/orden-servicio/crear/resumen', {
      state: { payload },
    });

    return { success: true, payload };
  };

  return { ids, handleStepSubmit, handleFinalSubmit, resetClienteId };
}
