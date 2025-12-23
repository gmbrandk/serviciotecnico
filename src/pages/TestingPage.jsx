// IngresoPage.jsx
import { useOSApi } from '@context/ordenServicio/OrdenServicioApiContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import FormIngreso from '@components/form-ingreso/FormIngreso';
import { buildOrdenPayload } from '@utils/form-ingreso/buildOrdenPayload';
//import { snapshotWizardPayload } from '@utils/form-ingreso/snapshotWizard';

import { useAuth } from '@context/AuthContext';
import { killOrdenServicioLocal } from '@utils/orden-servicio/ordenServicioLifecycle';
import { getOrCreateOrdenServicioUuid } from '@utils/orden-servicio/ordenServicioUuid';

import { buildIngresoInitialState } from '@utils/form-ingreso/buildIngresoInitialState';
// Inicializadores
import '@config/form-ingreso/init/clienteServiceInit';
import '@config/form-ingreso/init/equipoServiceInit';
import '@config/form-ingreso/init/osServiceInit';
import '@config/form-ingreso/init/tecnicoServiceInit';
import '@config/form-ingreso/init/tipoTrabajoServiceInit';

import '@styles/form-ingreso/index';

const TestingPage = () => {
  const { state } = useLocation();
  const payloadFromWizard = state?.payload || null;

  const navigate = useNavigate();
  const { crearOrdenServicio } = useOSApi();
  const { usuario, cargando, ensureAuth } = useAuth();

  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    ensureAuth({
      autoLogin: true,
      email: 'superadmin@example.com',
      password: 'admin123',
    });
  }, []);

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

  const handleCancel = useCallback(() => {
    if (!usuario) return;

    killOrdenServicioLocal({
      userId: usuario._id,
      ordenServicioUuid: ordenServicioUuidRef.current,
    });

    navigate('/dashboard');
  }, [usuario, navigate]);

  useEffect(() => {
    const mode = payloadFromWizard ? 'wizard' : 'panel';

    const initial = buildIngresoInitialState({
      mode,
      payloadFromWizard,
      ordenServicioUuid: ordenServicioUuidRef.current,
    });

    setInitialData(initial);
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

export default TestingPage;
