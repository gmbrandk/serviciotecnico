import OSPreview from '@components/OSPreview';

function PreviewPage() {
  const payload = JSON.parse(localStorage.getItem('payloadFinal') || '{}');

  return (
    <div style={{ padding: 30 }}>
      <h1>🔍 Vista Previa de Orden</h1>
      <OSPreview orden={payload} />
    </div>
  );
}

export default PreviewPage;
