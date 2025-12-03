import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOSApi } from '@context/ordenServicio/OrdenServicioApiContext';

function PayloadPage() {
  const { state } = useLocation();
  const payload = state?.payload || {};

  const navigate = useNavigate();
  const { crearOrdenServicio, obtenerOrdenPorId } = useOSApi();

  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [response, setResponse] = useState(null);
  const [ordenCompleta, setOrdenCompleta] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);

  // Enviar payload automáticamente al cargar
  useEffect(() => {
    if (!payload || Object.keys(payload).length === 0) return;

    const enviar = async () => {
      setStatus('sending');
      setErrorDetail(null);

      try {
        // 1️⃣ Crear orden de servicio
        const res = await crearOrdenServicio(payload);
        setResponse(res);

        if (!res?.success) {
          setStatus('error');
          setErrorDetail(res?.message || 'Error desconocido');
          return;
        }

        setStatus('success');

        // 2️⃣ Obtener orden completa
        if (res?.data?._id) {
          const orden = await obtenerOrdenPorId(res.data._id);
          setOrdenCompleta(orden);
        }
      } catch (err) {
        setStatus('error');
        setErrorDetail(err.message);
      }
    };

    enviar();
  }, [payload]);

  return (
    <div
      style={{
        padding: '40px',
        background: '#0a0a0a',
        minHeight: '100vh',
        color: '#0aff0a',
        fontFamily: `'IBM Plex Mono', monospace`,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          border: '1px solid #0aff0a55',
          padding: '20px 30px',
          background: 'rgba(0, 20, 0, 0.6)',
          backdropFilter: 'blur(3px)',
          letterSpacing: '1px',
          textShadow: '0 0 5px #0aff0a88',
          fontSize: '1.4rem',
        }}
      >
        <span style={{ color: '#0aff0a' }}>▌</span> OS STREAMING…
      </div>

      {/* PAYLOAD ENVIADO */}
      <Section title="PAYLOAD ENVIADO">
        {JSON.stringify(payload, null, 2)}
      </Section>

      {/* ESTADO */}
      <StatusDisplay status={status} error={errorDetail} />

      {/* RESPUESTA DEL BACKEND */}
      {response && (
        <Section title="RESPUESTA DEL BACKEND">
          {JSON.stringify(response, null, 2)}
        </Section>
      )}

      {/* ORDEN COMPLETA */}
      {ordenCompleta && (
        <Section title="ORDEN COMPLETA (DESDE BACKEND)">
          {JSON.stringify(ordenCompleta, null, 2)}
        </Section>
      )}

      {/* Animación */}
      <style>
        {`
          @keyframes flicker {
            0% { opacity: 1; }
            50% { opacity: 0.93; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <pre
      style={{
        padding: '25px',
        border: '1px solid #0aff0a33',
        background: '#000',
        overflowX: 'auto',
        fontSize: '0.95rem',
        lineHeight: '1.5rem',
        boxShadow: '0 0 12px #0aff0a55 inset',
        whiteSpace: 'pre-wrap',
        animation: 'flicker 1.8s infinite ease-in-out',
      }}
    >
      {`// ${title}\n\n`}
      {children}
    </pre>
  );
}

function StatusDisplay({ status, error }) {
  let text = '';
  if (status === 'idle') text = 'Esperando…';
  if (status === 'sending') text = 'Transmisión en curso…';
  if (status === 'success') text = 'Orden creada exitosamente ✓';
  if (status === 'error') text = `Error: ${error}`;

  return (
    <div
      style={{
        border: '1px solid #0aff0a55',
        padding: '15px 25px',
        background: '#000',
        color: status === 'error' ? '#ff5555' : '#0aff0a',
        fontSize: '1rem',
        whiteSpace: 'pre-wrap',
      }}
    >
      {text}
    </div>
  );
}

export default PayloadPage;
