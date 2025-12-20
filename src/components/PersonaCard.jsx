// src/components/PersonaCard.jsx
export default function PersonaCard({
  titulo,
  persona,
  subtitulo,
  mostrarBadge = false,
  variante = 'normal',
}) {
  return (
    <div className={`persona-block ${variante}`}>
      <div className="persona-header">
        <h2>{titulo}</h2>
        {mostrarBadge && <span className="persona-badge">Misma persona</span>}
      </div>

      {subtitulo && <p className="persona-subtitle">{subtitulo}</p>}

      <div className="os-grid">
        <div>
          <strong>Nombre:</strong> {persona?.nombres ?? '—'}{' '}
          {persona?.apellidos ?? ''}
        </div>
        <div>
          <strong>DNI:</strong> {persona.dni}
        </div>
        {persona.email && (
          <div>
            <strong>Email:</strong> {persona.email}
          </div>
        )}
        {persona.telefono && (
          <div>
            <strong>Teléfono:</strong> {persona.telefono}
          </div>
        )}
        {persona.direccion && (
          <div>
            <strong>Dirección:</strong> {persona.direccion}
          </div>
        )}
      </div>
    </div>
  );
}
