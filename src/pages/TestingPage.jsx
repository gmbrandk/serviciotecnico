// src/pages/TestingPage.jsx
import { useOSApi } from '@context/ordenServicio/OrdenServicioApiContext';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import FormIngreso from '@components/form-ingreso/FormIngreso';
import { buildOrdenPayload } from '@utils/form-ingreso/buildOrdenPayload';
import { normalizeOrdenPayload } from '@utils/form-ingreso/normalizeOrdenPayload';

import { useAuth } from '@context/AuthContext';

// inicializadores de servicios
import '@config/form-ingreso/init/clienteServiceInit';
import '@config/form-ingreso/init/equipoServiceInit';
import '@config/form-ingreso/init/osServiceInit';
import '@config/form-ingreso/init/tecnicoServiceInit';
import '@config/form-ingreso/init/tipoTrabajoServiceInit';

const TestingPage = () => {
  const { state } = useLocation();
  const payloadFromWizard = state?.payload || null;

  const navigate = useNavigate();
  const { crearOrdenServicio } = useOSApi();

  // 🔥 Usamos el AuthContext (NO más ensureAuth)
  const { usuario, cargando } = useAuth();

  const [initialData, setInitialData] = useState(null);
  const [payloadFinal, setPayloadFinal] = useState(null);
  const [sendingStatus, setSendingStatus] = useState(null);

  // 1. Normalizamos data del wizard
  useEffect(() => {
    if (payloadFromWizard) {
      const normalized = normalizeOrdenPayload(payloadFromWizard);
      setInitialData(normalized);
    }
  }, [payloadFromWizard]);

  const enviarAlBackend = async () => {
    if (!payloadFinal) return;
    setSendingStatus('loading');

    const res = await crearOrdenServicio(payloadFinal);

    if (res.success) {
      setSendingStatus('success');
      navigate('/dashboard/orden-servicio');
    } else {
      setSendingStatus(res.message || 'error');
    }
  };

  // 🔐 Esperamos la verificación del usuario desde el AuthContext
  if (cargando) {
    return <p style={{ padding: '2rem' }}>Cargando autenticación...</p>;
  }

  if (!usuario) {
    return (
      <p style={{ padding: '2rem', color: 'red' }}>
        ❌ No hay usuario autenticado (AuthContext).
      </p>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🧾 TestingPage — Formulario de Ingreso</h1>

      <FormIngreso
        initialPayload={initialData}
        role={usuario.role}
        onSubmit={(data) => {
          const payload = buildOrdenPayload(data);
          setPayloadFinal(payload);

          navigate('/enviarOS', { state: { payload } });
        }}
      />

      {/* PANEL DE PAYLOAD */}
      {payloadFinal && (
        <>
          <h2>📦 Payload generado por FormIngreso:</h2>
          <pre
            style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#111',
              color: '#0f0',
              borderRadius: '8px',
            }}
          >
            {JSON.stringify(payloadFinal, null, 2)}
          </pre>

          <button
            onClick={enviarAlBackend}
            style={{
              marginTop: '1.5rem',
              padding: '0.7rem 1.2rem',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            🚀 Enviar Orden de Servicio al Backend
          </button>

          {sendingStatus === 'loading' && <p>Enviando...</p>}
          {sendingStatus === 'success' && (
            <p style={{ color: 'green', marginTop: '1rem' }}>
              ✅ Orden creada correctamente.
            </p>
          )}
          {sendingStatus &&
            sendingStatus !== 'loading' &&
            sendingStatus !== 'success' && (
              <p style={{ color: 'red', marginTop: '1rem' }}>
                ❌ Error: {sendingStatus}
              </p>
            )}
        </>
      )}
    </div>
  );
};

export default TestingPage;
