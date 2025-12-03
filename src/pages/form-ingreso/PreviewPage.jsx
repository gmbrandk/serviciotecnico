import { useLocation } from 'react-router-dom';
import OSPreview from '../../components/OSPreview';

function PreviewPage() {
  const { state } = useLocation();

  // Si viene desde navigate(), perfecto
  const raw =
    state?.orden || JSON.parse(localStorage.getItem('payloadFinal') || '{}');

  const orden = raw?.details?.orden || raw;

  return (
    <div style={{ padding: 30 }}>
      <h1>🔍 Vista Previa de Orden</h1>
      <OSPreview orden={orden} />
    </div>
  );
}

export default PreviewPage;
