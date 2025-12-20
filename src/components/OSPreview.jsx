import Accordion from '@components/Accordion';
import InfoTooltip from '@components/InfoTooltip';
import OSPreviewPDFWrapper from '@components/OSPreviewPDFWrapper';
import PersonaCard from '@components/PersonaCard';
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

  const mismoCliente =
    cliente?.dni && representante?.dni && cliente.dni === representante.dni;

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
          logo: MacServiceLogo,
        }}
      />

      <div className="os-preview">
        <header className="os-header">
          <h1>Orden de Servicio</h1>
          <div className="os-header-row">
            <span className="os-code">{codigo}</span>
            <span className="os-date">
              Fecha de ingreso: {new Date(fechaIngreso).toLocaleString('es-PE')}
            </span>
          </div>
        </header>

        {/* PERSONAS */}
        <section className="os-section">
          {mismoCliente ? (
            <PersonaCard
              titulo="Responsable del servicio / propietario"
              persona={cliente}
              subtitulo="La misma persona realizó el ingreso del equipo"
              mostrarBadge
            />
          ) : (
            <>
              <PersonaCard
                titulo="Responsable del servicio / propietario"
                persona={cliente}
                subtitulo="Entidad que autoriza intervenciones y asume costos"
              />
              <PersonaCard
                titulo="Contacto"
                persona={representante}
                subtitulo="Entidad con prioridad de coordinación"
                variante="admin"
              />
            </>
          )}

          <p className="os-microcopy">
            El responsable del servicio autoriza las intervenciones y asume los
            costos
            <InfoTooltip text="El equipo puede ser ingresado por un tercero autorizado. La persona que realiza el ingreso no asume responsabilidad legal ni económica sobre el servicio." />
          </p>
        </section>

        {/* EQUIPO */}
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
              <strong>Serie:</strong> {equipo.nroSerie}
            </div>
          </div>
        </section>

        {/* DIAGNÓSTICO */}
        <section className="os-section">
          <h2>Diagnóstico declarado</h2>
          <p>{diagnosticoCliente}</p>
        </section>

        {/* OBSERVACIONES */}
        <section className="os-section">
          <h2>Observaciones</h2>
          <p>{observaciones}</p>
        </section>

        {/* SERVICIOS */}
        <section className="os-section">
          <h2>Servicios autorizados</h2>
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
                  <td>S/. {l.precioUnitario}</td>
                  <td>S/. {l.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="os-total">
            <strong>Total: S/. {total}</strong>
          </div>
        </section>

        {/* CONDICIONES */}
        <section className="os-section">
          <Accordion title="Condiciones del servicio">
            <ul>
              <li>La empresa realizará únicamente los servicios detallados.</li>
              <li>
                Reparaciones adicionales requerirán autorización del responsable
                del servicio.
              </li>
              <li>
                Durante el diagnóstico o reparación pueden producirse pérdidas
                de información.
              </li>
            </ul>
          </Accordion>
        </section>
      </div>
    </div>
  );
}
