// src/pages/form-ingreso/IngresoPage.jsx

import { useOSApi } from '@context/ordenServicio/OrdenServicioApiContext';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import FormIngreso from '@components/form-ingreso/FormIngreso';
import { buildOrdenPayload } from '@utils/form-ingreso/buildOrdenPayload';
import { normalizeOrdenPayload } from '@utils/form-ingreso/normalizeOrdenPayload';

import { useAuth } from '@context/AuthContext';

// Inicializadores (se mantienen)
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

  // Normalizar payload inicial que venga desde el Wizard
  useEffect(() => {
    if (payloadFromWizard) {
      const normalized = normalizeOrdenPayload(payloadFromWizard);
      setInitialData(normalized);
    }
  }, [payloadFromWizard]);

  // 🔐 Espera autenticación real
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
    <div className="formIngresoRoot" style={{ padding: '2rem' }}>
      <p style={{ marginBottom: '1rem' }}>
        Revisa la información antes de crear la Orden de Servicio.
      </p>

      <FormIngreso
        initialPayload={initialData}
        role={usuario.role}
        onSubmit={async (data) => {
          try {
            // 1️⃣ Construimos payload final
            const payload = buildOrdenPayload(data);

            // 2️⃣ Enviar al backend
            const res = await crearOrdenServicio(payload);

            if (!res.success) {
              console.error('❌ Error creando OS:', res.message);
              return;
            }

            // 3️⃣ Orden creada desde backend
            const ordenCreada = res.details?.orden;

            // 4️⃣ Navegar al detalle de OS creada
            navigate(`/dashboard/orden-servicio/${ordenCreada._id}`, {
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

export default IngresoPage;
