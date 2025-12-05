import OSPreviewPDFWrapper from '@components/OSPreviewPDFWrapper';
import { useEffect } from 'react';
import MacServiceLogo from '../assets/form-ingreso/MacServiceLogo.jpeg';
import '../styles/OSPreview.css';

export default function OSPreview({ orden }) {
  useEffect(() => {
    console.log('📄 Datos recibidos por OSPreview:', orden);
  }, [orden]);

  if (!orden) return <p>No se pudo cargar la orden.</p>;

  const {
    codigo,
    fechaIngreso,
    cliente,
    representante,
    equipo,
    diagnosticoCliente,
    observaciones,
    lineasServicio,
    total,
  } = orden;

  return (
    <div className="osPreviewRoot">
      {/* PDF */}
      <OSPreviewPDFWrapper
        orden={orden}
        negocio={{
          nombre: 'MacService E.I.R.L',
          ruc: '10480562041',
          direccion:
            'Calle Octavio Muñoz Najar 223 Galeria COMPUAREQUIPA int.232 2do Piso',
          telefono: '+51 949 105 405',
          email: 'teamcross_soporte@hotmail.com',
          logo: MacServiceLogo, // cuando tengas la imagen: "/assets/logo.png"
        }}
      />
      <div className="os-preview">
        <header className="os-header">
          <h1>Orden de Servicio</h1>

          <div className="os-header-row">
            <span className="os-code">{codigo}</span>
            <span className="os-date">
              Fecha de ingreso: {new Date(fechaIngreso).toLocaleString()}
            </span>
          </div>
        </header>

        {/* Cliente */}
        <section className="os-section">
          <h2>Cliente</h2>
          <div className="os-grid">
            <div>
              <strong>Nombre:</strong> {cliente.nombres} {cliente.apellidos}
            </div>
            <div>
              <strong>DNI:</strong> {cliente.dni}
            </div>
            <div>
              <strong>Email:</strong> {cliente.email}
            </div>
            <div>
              <strong>Teléfono:</strong> {cliente.telefono}
            </div>
          </div>
        </section>

        {/* Representante */}
        <section className="os-section">
          <h2>Representante</h2>
          <div className="os-grid">
            <div>
              <strong>Nombre:</strong> {representante.nombres}{' '}
              {representante.apellidos}
            </div>
            <div>
              <strong>DNI:</strong> {representante.dni}
            </div>
            <div>
              <strong>Email:</strong> {representante.email}
            </div>
            <div>
              <strong>Teléfono:</strong> {representante.telefono}
            </div>
          </div>
        </section>

        {/* Equipo */}
        <section className="os-section">
          <h2>Equipo</h2>
          <div className="os-grid">
            <div>
              <strong>Tipo:</strong> {equipo.tipo}
            </div>
            <div>
              <strong>Marca:</strong> {equipo.marca}
            </div>
            <div>
              <strong>Modelo:</strong> {equipo.modelo}
            </div>
            <div>
              <strong>SKU:</strong> {equipo.sku}
            </div>
            <div>
              <strong>Serie:</strong> {equipo.nroSerie}
            </div>
            <div>
              <strong>MAC:</strong> {equipo.macAddress}
            </div>
            <div>
              <strong>Identificación:</strong> {equipo.estadoIdentificacion}
            </div>
          </div>
        </section>

        {/* Diagnóstico */}
        <section className="os-section">
          <h2>Diagnóstico del Cliente</h2>
          <p>{diagnosticoCliente}</p>
        </section>

        {/* Observaciones */}
        <section className="os-section">
          <h2>Observaciones</h2>
          <p>{observaciones}</p>
        </section>

        {/* Línea de servicios */}
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
              {lineasServicio.map((l, i) => (
                <tr key={i}>
                  <td>{l.descripcion}</td>
                  <td>{l.cantidad}</td>
                  <td>${l.precioUnitario}</td>
                  <td>${l.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="os-total">
            <strong>Total: ${total}</strong>
          </div>
        </section>
      </div>
    </div>
  );
}
