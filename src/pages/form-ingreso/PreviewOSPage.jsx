import { useOSApi } from '@context/ordenServicio/OrdenServicioApiContext';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import OSPreview from '@components/OSPreview';

export default function PreviewOSPage() {
  const { state } = useLocation();
  const { id } = useParams();
  const { getOrdenServicioById } = useOSApi();

  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🟢 1. Si viene desde navigate(), tomarla inmediatamente
  useEffect(() => {
    if (state?.orden) {
      setOrden(state.orden);
      setLoading(false);
    }
  }, [state]);

  // 🟢 2. Si NO viene desde navigate() → cargar desde backend
  useEffect(() => {
    if (!state?.orden && id) {
      (async () => {
        const res = await getOrdenServicioById(id);
        if (res.success) {
          setOrden(res.details.orden);
        }
        setLoading(false);
      })();
    }
  }, [id, state, getOrdenServicioById]);

  if (loading) return <p style={{ padding: 30 }}>Cargando orden…</p>;
  if (!orden) return <p style={{ padding: 30 }}>Orden no encontrada</p>;

  return (
    <div style={{ padding: 30 }}>
      <OSPreview orden={orden} />
    </div>
  );
}
