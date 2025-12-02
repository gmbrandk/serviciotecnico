import { mockGetOrdenServicioById } from '@__mock__/ordenServicioMocks';
import FormIngreso from '@components/form-ingreso/FormIngreso';
import { buildOrdenPayload } from '@utils/form-ingreso/buildOrdenPayload';
import { ensureAuth } from '@utils/form-ingreso/ensureAuth';
import { normalizeOrdenPayload } from '@utils/form-ingreso/normalizeOrdenPayload';
import { useEffect, useState } from 'react';

import '@config/form-ingreso/init/clienteServiceInit';
import '@config/form-ingreso/init/equipoServiceInit';
import '@config/form-ingreso/init/osServiceInit';
import '@config/form-ingreso/init/tecnicoServiceInit';
import '@config/form-ingreso/init/tipoTrabajoServiceInit';

function IngresoPage() {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    async function authFlow() {
      const user = await ensureAuth();
      setUsuario(user);
    }
    authFlow();
  }, []);

  useEffect(() => {
    async function fetchMock() {
      const res = await mockGetOrdenServicioById('ORD12345');
      if (res.success) {
        const normalized = normalizeOrdenPayload(res.data);
        setInitialData(normalized);
      }
      setLoading(false);
    }
    fetchMock();
  }, []);

  if (loading)
    return <p style={{ padding: '2rem' }}>Cargando orden simulada...</p>;
  if (!usuario) return <p>Cargando autenticación...</p>;

  return (
    <div style={{ padding: 30 }}>
      <h1>🧾 Ingreso de Servicio Técnico</h1>

      <FormIngreso
        initialPayload={initialData}
        role={usuario.role}
        onSubmit={(data) => {
          const payload = buildOrdenPayload(data);
          localStorage.setItem('payloadFinal', JSON.stringify(payload));
          window.location.href = '/preview';
        }}
      />
    </div>
  );
}

export default IngresoPage;
