// src/pages/TestingPage.jsx
import { useOSApi } from '@context/ordenServicio/OrdenServicioApiContext';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import FormIngreso from '@components/form-ingreso/FormIngreso';
import { buildOrdenPayload } from '@utils/form-ingreso/buildOrdenPayload';
import { normalizeOrdenPayload } from '@utils/form-ingreso/normalizeOrdenPayload';

import { useAuth } from '@context/AuthContext';

// Inicializadores
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
  const { usuario, cargando } = useAuth();

  const [initialData, setInitialData] = useState(null);

  // Normalizar payload inicial que venga desde el Wizard
  useEffect(() => {
    if (payloadFromWizard) {
      const normalized = normalizeOrdenPayload(payloadFromWizard);
      setInitialData(normalized);
    }
  }, [payloadFromWizard]);

  // 🔐 Esperamos autenticación real
  if (cargando) {
    return <p style={{ padding: '2rem' }}>Cargando autenticación...</p>;
  }

  if (!usuario) {
    return (
      <p style={{ padding: '2rem', color: 'red' }}>
        ❌ No hay usuario autenticado.
      </p>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🧾 TestingPage — Formulario de Ingreso</h1>

      <FormIngreso
        initialPayload={initialData}
        role={usuario.role}
        onSubmit={async (data) => {
          try {
            // 1️⃣ Construimos payload
            const payload = buildOrdenPayload(data);

            // 2️⃣ Enviamos al backend
            const res = await crearOrdenServicio(payload);

            if (!res.success) {
              console.error('❌ Error creando OS:', res.message);
              return;
            }

            // 3️⃣ Obtenemos OS creada desde backend
            const ordenCreada = res.details?.orden;

            // 4️⃣ Navegamos a PreviewPage
            navigate('/preview', {
              state: { orden: ordenCreada },
            });
          } catch (err) {
            console.error('❌ Error inesperado enviando OS:', err);
          }
        }}
      />
    </div>
  );
};

export default TestingPage;
