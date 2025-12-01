import '../styles/OSPreview.css';
import OSPreviewPDFWrapper from '@components/OSPreviewPDFWrapper';

export default function OSPreview() {
  const orden = {
    codigo: 'OS-0095',
    fechaIngreso: '2025-11-13',
    cliente: {
      nombres: 'Hank',
      apellidos: 'Schrader',
      telefono: '+549984512648',
      email: 'hschrader@dea.com',
      direccion: '4901 Cumbre Del Sur Court NE, Albuquerque, NM',
    },
    equipo: {
      marca: 'ASUS',
      modelo: 'FX517ZE-ES73',
      nroSerie: 'N5NRCX071929213',
      cpu: 'Intel® Core™ i7-12650H',
      ram: '16GB DDR5',
      almacenamiento: '512GB NVMe',
      gpu: 'NVIDIA RTX 3050 Ti',
    },
    diagnosticoCliente:
      'Cliente indica que la laptop dejó de encender después de una caída.',
    observaciones: 'Equipo con carcasa rota en la esquina superior derecha.',
    lineasServicio: [
      {
        descripcion: 'Instalación de sistema operativo y programas básicos',
        cantidad: 1,
        precioUnitario: 40,
        subtotal: 40,
      },
      {
        descripcion: 'Reemplazo completo de pantalla LCD',
        cantidad: 1,
        precioUnitario: 260,
        subtotal: 260,
      },
    ],
    total: 300,
  };

  return (
    <div className="os-preview">
      {/* ---------- HEADER NUEVO ---------- */}
      <div className="os-extra-header">
        <h3>Lorem ipsum dolor sit amet</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
          consequat ante vitae lorem pulvinar, vitae ullamcorper nunc pretium.
        </p>
      </div>

      {/* ---------- EXISTENTE ---------- */}
      <header className="os-header">
        <div className="os-title">
          <h1>Orden de Servicio</h1>
          <span className="os-code">{orden.codigo}</span>
        </div>
        <div className="os-meta">
          <span>Fecha de ingreso: {orden.fechaIngreso}</span>
        </div>
      </header>

      {/* Datos del cliente */}
      <section className="os-section">
        <h2>Cliente</h2>
        <div className="os-grid">
          <div>
            <strong>Nombre:</strong> {orden.cliente.nombres}{' '}
            {orden.cliente.apellidos}
          </div>
          <div>
            <strong>Teléfono:</strong> {orden.cliente.telefono}
          </div>
          <div>
            <strong>Email:</strong> {orden.cliente.email}
          </div>
          <div>
            <strong>Dirección:</strong> {orden.cliente.direccion}
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="os-section">
        <h2>Equipo</h2>
        <div className="os-grid">
          <div>
            <strong>Marca:</strong> {orden.equipo.marca}
          </div>
          <div>
            <strong>Modelo:</strong> {orden.equipo.modelo}
          </div>
          <div>
            <strong>N° Serie:</strong> {orden.equipo.nroSerie}
          </div>
          <div>
            <strong>CPU:</strong> {orden.equipo.cpu}
          </div>
          <div>
            <strong>RAM:</strong> {orden.equipo.ram}
          </div>
          <div>
            <strong>Almacenamiento:</strong> {orden.equipo.almacenamiento}
          </div>
          <div>
            <strong>GPU:</strong> {orden.equipo.gpu}
          </div>
        </div>
      </section>

      {/* Diagnóstico */}
      <section className="os-section">
        <h2>Diagnóstico del Cliente</h2>
        <p>{orden.diagnosticoCliente}</p>
      </section>

      {/* Observaciones */}
      <section className="os-section">
        <h2>Observaciones</h2>
        <p>{orden.observaciones}</p>
      </section>

      {/* Tabla */}
      <section className="os-section">
        <h2>Servicios</h2>
        <table className="os-table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Cant.</th>
              <th>Precio U.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {orden.lineasServicio.map((linea, i) => (
              <tr key={i}>
                <td>{linea.descripcion}</td>
                <td>{linea.cantidad}</td>
                <td>${linea.precioUnitario}</td>
                <td>${linea.subtotal}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="os-total">
          <span>Total:</span>
          <strong>${orden.total}</strong>
        </div>
      </section>

      {/* ---------- FOOTER NUEVO ---------- */}
      <footer className="os-extra-footer">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
          feugiat lorem sit amet quam imperdiet, vitae sagittis neque tincidunt.
        </p>
      </footer>

      {/* PDF */}
      <OSPreviewPDFWrapper orden={orden} />
    </div>
  );
}
