import { useEffect, useRef, useState } from 'react';
import { LogBuffer } from '@utils/form-ingreso/LogBuffer';

export default function DevLogPanel() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState('all');
  const [logs, setLogs] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(LogBuffer.get());
    }, 300);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, open]);

  const categories = ['all', ...new Set(logs.map((l) => l.category))];

  const filtered = logs.filter((l) => {
    const passCat = category === 'all' || l.category === category;
    const passText =
      filter === '' ||
      JSON.stringify(l.args).toLowerCase().includes(filter.toLowerCase());

    return passCat && passText;
  });

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: open ? '420px' : '60px',
        height: open ? '350px' : '60px',
        background: '#1e1e1e',
        color: 'white',
        borderTopLeftRadius: '8px',
        border: '1px solid #444',
        transition: 'all 0.25s ease',
        zIndex: 99999,
        overflow: 'hidden',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: '6px 10px',
          background: '#333',
          borderBottom: '1px solid #444',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <span>🛠 Logs</span>
        <span>{open ? '▼' : '▲'}</span>
      </div>

      {open && (
        <div
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          {/* FILTER BAR */}
          <div
            style={{
              padding: '6px',
              background: '#2a2a2a',
              borderBottom: '1px solid #444',
            }}
          >
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                marginRight: '5px',
                background: '#444',
                color: 'white',
                border: '1px solid #666',
              }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Buscar..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                width: '120px',
                background: '#444',
                color: 'white',
                border: '1px solid #666',
              }}
            />

            <button
              onClick={() => LogBuffer.download()}
              style={{ marginLeft: 5, background: '#006dc4', color: 'white' }}
            >
              Exportar
            </button>

            <button
              onClick={() => LogBuffer.clear()}
              style={{ marginLeft: 5, background: '#b10000', color: 'white' }}
            >
              Limpiar
            </button>
          </div>

          {/* LOG LIST */}
          <div
            ref={scrollRef}
            style={{
              flexGrow: 1,
              overflowY: 'auto',
              padding: '6px',
              fontSize: '12px',
              fontFamily: 'monospace',
            }}
          >
            {filtered.map((l, i) => (
              <div key={i} style={{ marginBottom: '6px' }}>
                <div style={{ color: '#4ea1ff' }}>
                  [{l.timestamp}] [{l.category}]
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                  {JSON.stringify(l.args, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
