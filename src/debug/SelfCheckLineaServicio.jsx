import { log } from '@utils/form-ingreso/log';
import { useEffect } from 'react';

export default function SelfCheckLineaServicio({ index, linea }) {
  // Log inicial
  useEffect(() => {
    log('SELF-CHECK:LINEA', `Montada línea ${index}`, {
      index,
      uid: linea?.uid,
    });
  }, []);

  // Log cuando cambia la línea completa
  useEffect(() => {
    log('SELF-CHECK:LINEA', `Línea ${index} cambió`, {
      index,
      lineaCompleta: JSON.parse(JSON.stringify(linea)),
    });
  }, [linea]);

  // Verificar estructura de tipoTrabajo
  const tt = linea?.tipoTrabajo;

  let ttState = 'OK';
  let ttInfo = null;

  if (tt === null) {
    ttState = 'NULL';
  } else if (typeof tt === 'string') {
    ttState = 'STRING (ERROR)';
  } else if (Array.isArray(tt)) {
    ttState = 'ARRAY (ERROR)';
  } else if (typeof tt === 'object') {
    if (!tt._id) {
      ttState = 'OBJECT SIN _id (POSIBLE ERROR)';
    }
  } else {
    ttState = `TIPO INVALIDO: ${typeof tt}`;
  }

  ttInfo = JSON.stringify(tt, null, 2);

  return (
    <div
      style={{
        background: '#222',
        padding: 12,
        borderRadius: 6,
        marginTop: 8,
        marginBottom: 8,
        color: 'white',
        fontFamily: 'monospace',
      }}
    >
      <strong>
        Línea {index} (uid: {linea?.uid})
      </strong>

      <div style={{ marginTop: 6 }}>
        <strong>tipoTrabajo:</strong>
        <pre>{ttInfo}</pre>
      </div>

      <div style={{ marginTop: 6 }}>
        <strong>ESTADO tipoTrabajo:</strong> {ttState}
      </div>

      <div style={{ marginTop: 6 }}>
        <strong>Descripción:</strong> {linea?.descripcion || '(vacío)'}
      </div>
      <div>
        <strong>Cantidad:</strong> {linea?.cantidad}
      </div>
      <div>
        <strong>Precio unitario:</strong> {linea?.precioUnitario}
      </div>
    </div>
  );
}
