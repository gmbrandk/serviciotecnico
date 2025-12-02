// src/pages/TestingPage.jsx
import { useOSApi } from '@context/ordenServicio/OrdenServicioApiContext';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import FormIngreso from '@components/form-ingreso/FormIngreso';
import { buildOrdenPayload } from '@utils/form-ingreso/buildOrdenPayload';
import { ensureAuth } from '@utils/form-ingreso/ensureAuth';
import { normalizeOrdenPayload } from '@utils/form-ingreso/normalizeOrdenPayload';

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

  const [usuario, setUsuario] = useState(null);
  const [initialData, setInitialData] = useState(null); // para FormIngreso
  const [payloadFinal, setPayloadFinal] = useState(null); // payload del form
  const [sendingStatus, setSendingStatus] = useState(null);

  // ----------------------------------------
  // 1) Autenticación
  // ----------------------------------------
  useEffect(() => {
    async function authFlow() {
      const user = await ensureAuth();
      setUsuario(user);
    }
    authFlow();
  }, []);

  // ----------------------------------------
  // 2) Si viene payload desde el wizard → lo normalizamos y usamos como initialData
  // ----------------------------------------
  useEffect(() => {
    if (!payloadFromWizard) return;

    const normalized = normalizeOrdenPayload(payloadFromWizard);
    setInitialData(normalized);
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

  if (!usuario)
    return <p style={{ padding: '2rem' }}>Cargando autenticación...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🧾 TestingPage — Formulario de Ingreso</h1>

      {/* ---------------------------------------------------------
         3) FORMULARIO DE INGRESO (mismo que en IngresoPage)
      ---------------------------------------------------------- */}
      <FormIngreso
        initialPayload={initialData}
        role={usuario.role}
        onSubmit={(data) => {
          const payload = buildOrdenPayload(data);
          setPayloadFinal(payload);

          // Guardamos para posible navegación
          navigate('/payload', { state: { payload } });
        }}
      />

      {/* ---------------------------------------------------------
         4) PANEL DE PAYLOAD (el que ya tenía TestingPage)
      ---------------------------------------------------------- */}
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
              ✅ Orden de Servicio creada correctamente.
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
