import Accordion from '@components/Accordion';
import InfoTooltip from '@components/InfoTooltip';
import OSPreviewPDFWrapper from '@components/OSPreviewPDFWrapper';
import PersonaCard from '@components/PersonaCard';
import MacServiceLogo from '../assets/form-ingreso/MacServiceLogo.jpeg';
import '../styles/OSPreview.css';

const ordenesMockEjemplo = [
  {
    _id: 'OS-001',
    codigo: 'OS-001',
    fechaIngreso: '2025-12-01T15:30:00Z',
    cliente: {
      nombres: 'Juan',
      apellidos: 'Pérez',
      dni: '12345678',
      email: 'juan@correo.com',
      telefono: '+51999999999',
    },
    representante: {
      nombres: 'Juan',
      apellidos: 'Pérez',
      dni: '12345678',
      email: 'juan@correo.com',
      telefono: '+51999999999',
    },
    equipo: {
      tipo: 'Laptop',
      marca: 'Apple',
      modelo: 'MacBook Pro',
      nroSerie: 'ABC123',
    },
    diagnosticoCliente: 'No enciende',
    observaciones: 'Equipo mojado',
    lineasServicio: [
      {
        descripcion: 'Diagnóstico',
        cantidad: 1,
        precioUnitario: 50,
        subtotal: 50,
      },
    ],
    total: 50,
  },
  {
    _id: 'OS-002',
    codigo: 'OS-002',
    fechaIngreso: '2025-12-02T10:15:00Z',
    cliente: {
      nombres: 'Hank',
      apellidos: 'Schrader',
      dni: '29548456',
      email: 'hschrader@dea.com',
      telefono: '+549984512648',
    },
    representante: {
      nombres: 'Jorge Enrique',
      apellidos: 'Ugarte Olivera',
      dni: '45724467',
      email: 'jorge.ugarte@hotmail.com',
      telefono: '+51907128234',
    },
    equipo: {
      tipo: 'Laptop',
      marca: 'ASUS',
      modelo: 'FX517ZE',
      nroSerie: 'N5NRCX071929213',
    },
    diagnosticoCliente: 'Caída brusca',
    observaciones: 'Teclas rotas',
    lineasServicio: [
      {
        descripcion: 'Cambio de teclado',
        cantidad: 1,
        precioUnitario: 180,
        subtotal: 180,
      },
    ],
    total: 180,
  },
];

export default function TestingPage() {
  const orden = ordenesMockEjemplo[1];

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
      <OSPreviewPDFWrapper
        orden={orden}
        negocio={{
          nombre: 'MacService E.I.R.L',
          ruc: '10480562041',
          direccion: 'Calle Octavio Muñoz Najar 223',
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
              titulo="Responsable del servicio/ propietario"
              persona={cliente}
              subtitulo="La misma persona realizó el ingreso del equipo"
              mostrarBadge
            />
          ) : (
            <>
              <PersonaCard
                titulo="Responsable del servicio/ propietario"
                persona={cliente}
                subtitulo="Entidad que podria autorizar las intervenciones y asumir los costos"
              />
              <PersonaCard
                titulo="Contacto"
                persona={representante}
                subtitulo="Entidad con prioridad de coordinacion"
                variante="admin"
              />
            </>
          )}

          {/* Microcopy + Tooltip */}
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

        {/* SERVICIOS (tabla intacta) */}
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
                Reparaciones adicionales o de mayor costo requerirán
                autorización del responsable del servicio.
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
