function PayloadPage() {
  const payload = JSON.parse(localStorage.getItem('payloadFinal') || '{}');

  return (
    <div style={{ padding: 30 }}>
      <h2>📦 Payload JSON final</h2>
      <pre style={{ background: '#eee', padding: 20 }}>
        {JSON.stringify(payload, null, 2)}
      </pre>
    </div>
  );
}

export default PayloadPage;
