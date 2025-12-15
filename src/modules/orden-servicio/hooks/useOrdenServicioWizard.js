import { useCliente } from '@context/cliente/ClienteContext';
import { useEquipo } from '@context/equipo/EquipoContext';
import { useOSApi } from '@context/ordenServicio/OrdenServicioApiContext';
import { useReducer, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { getOrCreateOrdenServicioUuid } from '@utils/orden-servicio/ordenServicioUuid';

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

  // 🔐 Identidad estable de la Orden de Servicio (frontend-only)
  const ordenServicioUuidRef = useRef(null);

  // Contextos
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

  // Crear equipo usando context
  const crearEquipoWizard = async (equipoData, extra = {}) => {
    const res = await crearEquipo({
      ...equipoData,
      clienteActual: ids.clienteId,
      ...extra,
    });

    if (res.success && res.details?.equipo?._id) {
      dispatch({ type: 'SET_EQUIPO', payload: res.details.equipo._id });
      onSuccess?.('Equipo creado con éxito.');
      return { success: true };
    }

    onError?.(res.message);
    return res;
  };

  const handleStepSubmit = async (currentStep, orden) => {
    const data = orden[currentStep.id] || {};

    // Asegurar UUID desde el primer paso real
    if (!ordenServicioUuidRef.current) {
      ordenServicioUuidRef.current = getOrCreateOrdenServicioUuid(
        orden?.ordenServicioUuid
      );
    }

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

      // Modo ficha técnica: no crear equipo aún
      if (orden.equipo?.especificaciones === true) {
        logger.log('📌 Avanzando sin crear equipo (modo ficha técnica).');
        return { success: true };
      }

      // Equipo existente
      if (orden.equipo?._id) {
        dispatch({ type: 'SET_EQUIPO', payload: orden.equipo._id });
        return { success: true };
      }

      return crearEquipoWizard(orden.equipo);
    }

    // === FICHA TÉCNICA ===
    if (currentStep.id === 'ficha-tecnica') {
      const check = validateIds(['clienteId']);
      if (!check.success) return check;

      return crearEquipoWizard(orden.equipo, {
        fichaTecnicaManual: orden.fichaTecnica,
      });
    }

    return { success: true };
  };

  // Submit final
  const handleFinalSubmit = async (orden) => {
    const check = validateIds(['clienteId', 'equipoId']);
    if (!check.success) return check;

    // Blindaje final del UUID
    if (!ordenServicioUuidRef.current) {
      ordenServicioUuidRef.current = getOrCreateOrdenServicioUuid(
        orden?.ordenServicioUuid
      );
    }
    logger.log('[OS UUID][WIZARD]', ordenServicioUuidRef.current);

    const payload = buildPayload({
      ids,
      orden: {
        ...orden,
        ordenServicioUuid: ordenServicioUuidRef.current,
      },
      tecnicoId,
    });

    navigate('/dashboard/orden-servicio/crear/resumen', {
      state: { payload },
    });

    return { success: true, payload };
  };

  return {
    ids,
    handleStepSubmit,
    handleFinalSubmit,
    resetClienteId,
  };
}
