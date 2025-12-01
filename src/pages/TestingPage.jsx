// src/pages/TestingPage.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mini-proyecto imports
import FormIngreso from '@components/form-ingreso/FormIngreso';
import OSPreview from '@components/OSPreview';
import DevLogPanel from '@components/DevLogPanel';

import { mockGetOrdenServicioById } from '@__mock__/ordenServicioMocks';
import { normalizeOrdenPayload } from '@utils/form-ingreso/normalizeOrdenPayload';
import { buildOrdenPayload } from '@utils/form-ingreso/buildOrdenPayload';
import { ensureAuth } from '@utils/form-ingreso/ensureAuth';

// Inicializadores del mini-proyecto
import '@config/form-ingreso/init/clienteServiceInit';
import '@config/form-ingreso/init/equipoServiceInit';
import '@config/form-ingreso/init/tecnicoServiceInit';
import '@config/form-ingreso/init/tipoTrabajoServiceInit';

// Contexto real de API para enviar al backend
import { useOSApi } from '@context/ordenServicio/OrdenServicioApiContext';

const TestingPage = () => {
  const { crearOrdenServicio } = useOSApi();
  const navigate = useNavigate();

  // Mini-proyecto state
  const [usuario, setUsuario] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simula autenticación (de tu mini proyecto)
  useEffect(() => {
    ensureAuth().then(setUsuario);
  }, []);

  // Carga inicial desde mock
  useEffect(() => {
    async function fetchMock() {
      const res = await mockGetOrdenServicioById('ORD12345');

      if (res.success) {
        setInitialData(normalizeOrdenPayload(res.data));
      }

      setLoading(false);
    }

    fetchMock();
  }, []);

  const enviarAlBackend = async () => {
    if (!payload) return alert('No hay payload para enviar');

    const res = await crearOrdenServicio(payload);

    if (res.success) {
      navigate('/dashboard/orden-servicio');
    } else {
      alert(res.message || 'Error al enviar OS');
    }
  };

  // Loaders
  if (loading)
    return <div style={{ padding: '2rem' }}>Cargando orden simulada...</div>;
  if (!usuario)
    return <div style={{ padding: '2rem' }}>Cargando autenticación…</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🧪 Laboratorio de Ingreso OS (TestingPage)</h1>

      <p style={{ color: '#666', marginBottom: '20px' }}>
        Versión de desarrollo del formulario de ingreso. Aquí no comprometes la
        app real.
      </p>

      <FormIngreso
        initialPayload={initialData}
        role={usuario.role}
        onSubmit={(data) => setPayload(buildOrdenPayload(data))}
      />

      {payload && (
        <div style={{ marginTop: '2rem' }}>
          <h3>📦 Payload generado:</h3>
          <pre
            style={{
              background: '#111',
              color: '#0f0',
              padding: '1rem',
              borderRadius: '6px',
              overflowX: 'auto',
            }}
          >
            {JSON.stringify(payload, null, 2)}
          </pre>

          <button
            onClick={enviarAlBackend}
            style={{
              marginTop: '1.2rem',
              padding: '0.7rem 1.2rem',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            🚀 Enviar al Backend (Real)
          </button>
        </div>
      )}

      <OSPreview orden={payload} />
      {window.DEBUG && <DevLogPanel />}
    </div>
  );
};

export default TestingPage;
