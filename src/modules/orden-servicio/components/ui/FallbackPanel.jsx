// src/components/ui/FallbackPanel.jsx
import React from 'react';

export function FallbackPanel({ type = 'error', message, onRetry }) {
  const isError = type === 'error';

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '1.5rem',
        margin: '2rem auto',
        maxWidth: '400px',
        borderRadius: '12px',
        background: isError ? '#fff8f8' : '#f9f9f9',
        border: `1px solid ${isError ? '#ffcccc' : '#ddd'}`,
        color: isError ? '#c0392b' : '#555',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>
        {isError ? '📡 Sin conexión a Internet' : '⏳ Cargando datos...'}
      </p>
      <p style={{ marginBottom: '1rem' }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '6px',
            background: isError ? '#e74c3c' : '#3498db',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          🔄 Reintentar
        </button>
      )}
    </div>
  );
}
