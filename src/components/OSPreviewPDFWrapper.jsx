// components/OSPreviewPDFWrapper.jsx
import OSPreviewPDF from '@components/OSPreviewPDF';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';

export default function OSPreviewPDFWrapper({ orden, negocio }) {
  if (!orden) return null;

  const fileName = `Nº${orden.codigo}.pdf`;

  const handleOpenPDF = async () => {
    const blob = await pdf(
      <OSPreviewPDF orden={orden} negocio={negocio} />
    ).toBlob();

    const url = URL.createObjectURL(blob);

    // fuerza nombre correcto
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();

    window.open(url, '_blank');

    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const handleSendWhatsApp = () => {
    const telefono = orden.representante?.telefono || orden.cliente?.telefono;

    if (!telefono) {
      alert('No hay número de teléfono disponible');
      return;
    }

    const mensaje = encodeURIComponent(
      `Hola, te comparto la Orden de Servicio ${orden.codigo}.`
    );

    window.open(
      `https://wa.me/${telefono.replace(/\D/g, '')}?text=${mensaje}`,
      '_blank'
    );
  };

  return (
    <div className="os-action-bar">
      <button className="os-btn os-btn-primary" onClick={handleOpenPDF}>
        Ver PDF
      </button>

      <PDFDownloadLink
        document={<OSPreviewPDF orden={orden} negocio={negocio} />}
        fileName={fileName}
        className="os-btn os-btn-secondary"
      >
        Descargar PDF
      </PDFDownloadLink>

      <button className="os-btn os-btn-whatsapp" onClick={handleSendWhatsApp}>
        Enviar por WhatsApp
      </button>
    </div>
  );
}
