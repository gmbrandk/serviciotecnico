// components/OSPreviewPDFWrapper.jsx
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { useState } from 'react';
import OSPreviewPDF from '@components/OSPreviewPDF';

export default function OSPreviewPDFWrapper({ orden }) {
  const [open, setOpen] = useState(false);

  if (!orden) return <p>No hay datos para generar PDF.</p>;

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Botón ver PDF */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: '10px 16px',
          borderRadius: '5px',
          background: '#EB0901',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          marginRight: '10px',
        }}
      >
        {open ? 'Cerrar visor' : 'Ver PDF'}
      </button>

      {/* Botón descarga */}
      <PDFDownloadLink
        document={<OSPreviewPDF orden={orden} />}
        fileName={`orden-${orden.codigo}.pdf`}
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

      {/* Viewer PDF */}
      {open && (
        <div
          style={{
            marginTop: '20px',
            border: '1px solid #ccc',
            height: '80vh',
          }}
        >
          <PDFViewer style={{ width: '100%', height: '100%' }}>
            <OSPreviewPDF orden={orden} />
          </PDFViewer>
        </div>
      )}
    </div>
  );
}
