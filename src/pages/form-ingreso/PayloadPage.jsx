import { useLocation } from 'react-router-dom';

function PayloadPage() {
  const { state } = useLocation();
  const payload = state?.payload || {};

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
        <span style={{ color: '#0aff0a' }}>▌</span> PAYLOAD STREAM ACTIVE…
      </div>

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
        {JSON.stringify(payload, null, 2)}
      </pre>

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

export default PayloadPage;
