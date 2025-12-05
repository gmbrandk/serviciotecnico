// components/OSPreviewPDFWrapper.jsx
import OSPreviewPDF from '@components/OSPreviewPDF';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';

export default function OSPreviewPDFWrapper({ orden, negocio }) {
  if (!orden) return <p>No hay datos para generar PDF.</p>;

  const handleOpenPDF = async () => {
    const blob = await pdf(
      <OSPreviewPDF orden={orden} negocio={negocio} />
    ).toBlob();

    const fileName = `Nº${orden.codigo}.pdf`;

    // Crear URL del Blob
    const url = URL.createObjectURL(blob);

    // Crear link de descarga invisble con filename
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click(); // Fuerza que el navegador registre el filename

    // Luego abrir en nueva pestaña
    window.open(url, '_blank');

    // Limpieza
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Botón abrir en nueva pestaña */}
      <button
        onClick={handleOpenPDF}
        style={{
          padding: '10px 16px',
          borderRadius: '5px',
          background: '#1A4D8F', // nuevo color corporativo
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          marginRight: '10px',
        }}
      >
        Ver PDF
      </button>

      {/* Botón descarga directo */}
      <PDFDownloadLink
        document={<OSPreviewPDF orden={orden} negocio={negocio} />}
        fileName={`Nº${orden.codigo}.pdf`}
        style={{
          padding: '10px 16px',
          borderRadius: '5px',
          border: '1px solid #666',
          color: '#333',
          background: '#fff',
          cursor: 'pointer',
          textDecoration: 'none',
        }}
      >
        Descargar PDF
      </PDFDownloadLink>
    </div>
  );
}
