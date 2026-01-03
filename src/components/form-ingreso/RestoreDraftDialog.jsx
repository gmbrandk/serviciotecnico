import '@styles/form-ingreso/restore-dialog.css';
import { useEffect } from 'react';

function formatValue(v) {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'object') return v.nombre ?? JSON.stringify(v);
  return String(v);
}

function renderDiff(d) {
  if (!d) {
    console.log('[RestoreDraftDialog] renderDiff → d es null/undefined');
    return <li>No se detectaron cambios</li>;
  }

  console.log('[RestoreDraftDialog] renderDiff → diff recibido:', d);
  console.log('[RestoreDraftDialog] renderDiff → keys:', Object.keys(d));

  const items = [];

  const renderFieldList = (title, fields) => (
    <li key={title}>
      <strong>{title}</strong>
      <ul className="ingreso-diff-sublist">
        {fields.map((f) => (
          <li key={f.field}>
            {f.field}: <em>{formatValue(f.old)}</em> →{' '}
            <strong>{formatValue(f.new)}</strong>
          </li>
        ))}
      </ul>
    </li>
  );

  /*───────────────────────────────
    CLIENTE
  ───────────────────────────────*/
  if (d.cliente?.fields?.length > 0) {
    items.push(renderFieldList('Cliente', d.cliente.fields));
  }

  /*───────────────────────────────
    EQUIPO
  ───────────────────────────────*/
  if (d.equipo?.fields?.length > 0) {
    items.push(renderFieldList('Equipo', d.equipo.fields));
  }

  /*───────────────────────────────
    TÉCNICO
  ───────────────────────────────*/
  if (d.tecnico?.fields?.length > 0) {
    items.push(renderFieldList('Técnico', d.tecnico.fields));
  }

  /*───────────────────────────────
    LÍNEAS
  ───────────────────────────────*/
  if (d.lineas) {
    const { added = [], removed = [], modified = [] } = d.lineas;

    // -------- AGREGADAS ----------
    if (added.length > 0) {
      items.push(
        <li key="lineas-added">
          <strong>Líneas agregadas:</strong> {added.length}
          <ul style={{ marginTop: 6 }}>
            {added.map((l) => (
              <li key={l.uid}>
                <strong>Línea nueva</strong> ({l.uid.slice(0, 6)})
                <ul>
                  <li>Descripción: {formatValue(l.descripcion)}</li>
                  <li>Cantidad: {formatValue(l.cantidad)}</li>
                  <li>Precio unitario: {formatValue(l.precioUnitario)}</li>
                  <li>Tipo de trabajo: {formatValue(l.tipoTrabajo?.nombre)}</li>
                </ul>
              </li>
            ))}
          </ul>
        </li>
      );
    }

    // -------- ELIMINADAS ----------
    if (removed.length > 0) {
      items.push(
        <li key="lineas-removed">
          <strong>Líneas eliminadas:</strong> {removed.length}
          <ul style={{ marginTop: 6 }}>
            {removed.map((uid) => (
              <li key={uid}>Línea {uid.slice(0, 6)}</li>
            ))}
          </ul>
        </li>
      );
    }

    // -------- MODIFICADAS ----------
    if (modified.length > 0) {
      items.push(
        <li key="lineas-modified">
          <strong>Líneas modificadas:</strong>
          <ul style={{ marginTop: 6 }}>
            {modified.map((l) => (
              <li key={l.uid}>
                Línea {l.uid.slice(0, 6)}
                <ul>
                  {l.changes.map((c) => (
                    <li key={c.field}>
                      {c.field}: <em>{formatValue(c.old)}</em> →{' '}
                      <strong>{formatValue(c.new)}</strong>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </li>
      );
    }
  }

  if (items.length === 0) return <li>No se detectaron cambios</li>;

  return items;
}

export default function RestoreDraftDialog({
  open,
  draft,
  onRestore,
  onDiscard,
}) {
  /*────────────────────────────────────
    🔍 Log de props entrantes
  ────────────────────────────────────*/
  useEffect(() => {
    console.group('[RestoreDraftDialog] props');
    console.log('open:', open);
    console.log('draft:', draft);

    if (draft) {
      console.log('draft.timestamp:', draft.timestamp);
      console.log(
        'draft.data:',
        draft.data,
        'keys:',
        draft.data ? Object.keys(draft.data) : null
      );
    }

    console.groupEnd();
  }, [open, draft]);

  if (!open || !draft) {
    console.log(
      '[RestoreDraftDialog] no render →',
      !open ? 'open=false' : 'draft=null'
    );
    return null;
  }

  /*────────────────────────────────────
    🔍 Log previo a render del diff
  ────────────────────────────────────*/
  console.log(
    '[RestoreDraftDialog] render → mostrando diff con data:',
    draft.data
  );

  return (
    <div className="ingreso-restore-overlay">
      <div className="ingreso-restore-modal">
        <div className="ingreso-restore-header">
          <h3>🔄 Recuperar formulario guardado</h3>
          <p>Se encontró un progreso guardado automáticamente.</p>
        </div>

        <div className="ingreso-restore-content">
          <strong>Fecha de guardado:</strong>
          <br />
          {new Date(draft.timestamp).toLocaleString()}

          <hr />

          <strong>Detalles del cambio:</strong>

          <ul className="ingreso-restore-diff">
            {(!draft.data || Object.keys(draft.data).length === 0) && (
              <li>
                {console.log('[RestoreDraftDialog] diff vacío o inexistente') ||
                  'Ninguno'}
              </li>
            )}

            {draft.data &&
              (console.log(
                '[RestoreDraftDialog] renderDiff llamado con:',
                draft.data
              ) ||
                renderDiff(draft.data))}
          </ul>
        </div>

        <div className="ingreso-restore-footer">
          <button
            onClick={() => {
              console.log(
                '[RestoreDraftDialog] click → DESCARTAR draft',
                draft
              );
              onDiscard();
            }}
            className="ingreso-btn ingreso-btn-discard"
          >
            ❌ Descartar
          </button>

          <button
            onClick={() => {
              console.log(
                '[RestoreDraftDialog] click → RESTAURAR draft',
                draft
              );
              onRestore();
            }}
            className="ingreso-btn ingreso-btn-restore"
          >
            🔄 Restaurar
          </button>
        </div>
      </div>
    </div>
  );
}
