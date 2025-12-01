export default function OSPrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        padding: '10px 16px',
        borderRadius: '5px',
        border: '1px solid #444',
        background: '#fff',
        cursor: 'pointer',
        marginRight: '10px',
      }}
      className="no-print"
    >
      Imprimir
    </button>
  );
}
