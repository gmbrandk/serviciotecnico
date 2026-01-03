import { formatValue } from '../../utils/form-ingreso/formatValue';
import ClienteDiffView from './ClienteDiffView';
import FieldList from './FieldList';

export default function DiffViewer({ diff }) {
  if (!diff || Object.keys(diff).length === 0) {
    return <p>No se detectaron cambios</p>;
  }

  const { cliente, equipo, tecnico, lineas } = diff;

  return (
    <ul className="diff-list">
      <ClienteDiffView cliente={cliente} />

      <FieldList title="Equipo" fields={equipo?.fields} />
      <FieldList title="Técnico" fields={tecnico?.fields} />

      {lineas && (
        <>
          {lineas.added?.length > 0 && (
            <li>
              <strong>Líneas agregadas:</strong> {lineas.added.length}
              <ul className="diff-sublist">
                {lineas.added.map((l) => (
                  <li key={l.uid}>
                    Línea nueva ({l.uid.slice(0, 6)})
                    <ul className="diff-sublist">
                      <li>Descripción: {formatValue(l.descripcion)}</li>
                      <li>Cantidad: {formatValue(l.cantidad)}</li>
                      <li>Precio unitario: {formatValue(l.precioUnitario)}</li>
                      <li>
                        Tipo de trabajo: {formatValue(l.tipoTrabajo?.nombre)}
                      </li>
                    </ul>
                  </li>
                ))}
              </ul>
            </li>
          )}

          {lineas.removed?.length > 0 && (
            <li>
              <strong>Líneas eliminadas:</strong> {lineas.removed.length}
              <ul className="diff-sublist">
                {lineas.removed.map((uid) => (
                  <li key={uid}>Línea {uid.slice(0, 6)}</li>
                ))}
              </ul>
            </li>
          )}

          {lineas.modified?.length > 0 && (
            <li>
              <strong>Líneas modificadas:</strong>
              <ul className="diff-sublist">
                {lineas.modified.map((l) => (
                  <li key={l.uid}>
                    Línea {l.uid.slice(0, 6)}
                    <ul className="diff-sublist">
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
          )}
        </>
      )}
    </ul>
  );
}
