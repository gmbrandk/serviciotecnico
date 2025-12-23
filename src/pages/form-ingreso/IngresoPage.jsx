// IngresoPage.jsx
import { useOSApi } from '@context/ordenServicio/OrdenServicioApiContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import FormIngreso from '@components/form-ingreso/FormIngreso';
import { buildIngresoInitialState } from '@utils/form-ingreso/buildIngresoInitialState';
import { buildOrdenPayload } from '@utils/form-ingreso/buildOrdenPayload';
import { snapshotWizardPayload } from '@utils/form-ingreso/snapshotWizard';

import { useAuth } from '@context/AuthContext';
import { killOrdenServicioLocal } from '@utils/orden-servicio/ordenServicioLifecycle';
import { getOrCreateOrdenServicioUuid } from '@utils/orden-servicio/ordenServicioUuid';

// Inicializadores
import '@config/form-ingreso/init/clienteServiceInit';
import '@config/form-ingreso/init/equipoServiceInit';
import '@config/form-ingreso/init/osServiceInit';
import '@config/form-ingreso/init/tecnicoServiceInit';
import '@config/form-ingreso/init/tipoTrabajoServiceInit';

import '../../styles/form-ingreso/index';

const IngresoPage = () => {
  const { state } = useLocation();
  const payloadFromWizard = state?.payload || null;

  const navigate = useNavigate();
  const { crearOrdenServicio } = useOSApi();
  const { usuario, cargando } = useAuth();

  const [initialData, setInitialData] = useState(null);

  // 🔐 UUID raíz estable
  const ordenServicioUuidRef = useRef(null);

  if (!ordenServicioUuidRef.current) {
    ordenServicioUuidRef.current = getOrCreateOrdenServicioUuid(
      payloadFromWizard?.ordenServicioUuid
    );

    console.log(
      '%c[OS UUID][ROOT]',
      'background:#003366;color:#fff;padding:4px;',
      ordenServicioUuidRef.current
    );
  }

  // ☠️ CANCELAR — muerte del UUID
  const handleCancel = useCallback(() => {
    const ok = window.confirm(
      '¿Cancelar la creación de la Orden de Servicio?\nSe perderán los cambios.'
    );

    if (!ok) return;

    killOrdenServicioLocal({
      userId: usuario._id,
      ordenServicioUuid: ordenServicioUuidRef.current,
    });

    navigate('/dashboard');
  }, [usuario._id, navigate]);

  // 🧠 Inicialización unificada: Wizard o Panel
  useEffect(() => {
    if (payloadFromWizard) {
      const snap = snapshotWizardPayload({
        ...payloadFromWizard,
        ordenServicioUuid: ordenServicioUuidRef.current,
      });

      setInitialData(snap);
    } else {
      const empty = buildIngresoInitialState({
        mode: 'panel',
        ordenServicioUuid: ordenServicioUuidRef.current,
      });

      setInitialData(empty);
    }
  }, [payloadFromWizard]);

  // ⏳ Auth
  if (cargando) {
    return <p style={{ padding: '2rem' }}>Cargando autenticación...</p>;
  }

  if (!usuario) {
    return <p style={{ padding: '2rem', color: 'red' }}>❌ No hay usuario</p>;
  }

  if (!initialData) {
    return <p style={{ padding: '2rem' }}>Inicializando formulario...</p>;
  }

  return (
    <div className="formIngresoRoot" style={{ padding: '2rem' }}>
      <FormIngreso
        initialPayload={initialData}
        ordenServicioUuid={ordenServicioUuidRef.current}
        role={usuario.role}
        onCancel={handleCancel}
        onSubmit={async (data) => {
          const payload = buildOrdenPayload({
            ...data,
            ordenServicioUuid: ordenServicioUuidRef.current,
          });

          const res = await crearOrdenServicio(payload);
          if (!res.success) return;

          // ☠️ MUERTE AL GUARDAR OK
          killOrdenServicioLocal({
            userId: usuario._id,
            ordenServicioUuid: ordenServicioUuidRef.current,
          });

          const ordenCreada = res.details?.orden;

          // 🚀 Navegar a la OS creada (el Context limpia autosave)
          navigate(`/dashboard/orden-servicio/${ordenCreada._id}`, {
            state: { orden: ordenCreada },
          });
        }}
      />
    </div>
  );
};

export default IngresoPage;
