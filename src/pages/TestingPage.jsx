// ✅ src/pages/TestingPage.jsx
import { useOSApi } from '@context/ordenServicio/OrdenServicioApiContext';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
const TestingPage = () => {
  const { state } = useLocation();
  const payload = state?.payload;

  const navigate = useNavigate();

  const { crearOrdenServicio } = useOSApi();

  const [status, setStatus] = useState(null);

  const enviarAlBackend = async () => {
    setStatus('loading');

    const res = await crearOrdenServicio(payload);

    if (res.success) {
      navigate('/dashboard/orden-servicio');
    } else {
      alert(res.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Testing Page</h1>

      {!payload && <p>No se recibió payload. Navega desde el wizard.</p>}

      {payload && (
        <>
          <h2>✅ Payload recibido:</h2>
          <pre
            style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#111',
              color: '#0f0',
              borderRadius: '8px',
              overflowX: 'auto',
            }}
          >
            {JSON.stringify(payload, null, 2)}
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

          {status === 'loading' && <p>Enviando...</p>}
          {status === 'success' && (
            <p style={{ color: 'green', marginTop: '1rem' }}>
              ✅ Orden de Servicio creada correctamente.
            </p>
          )}
          {status && status !== 'loading' && status !== 'success' && (
            <p style={{ color: 'red', marginTop: '1rem' }}>
              ❌ Error: {status}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default TestingPage;
