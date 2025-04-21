// src/pages/TestingPage.jsx
import React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Toast from '../components/shared/Toast'; // Importa el componente Toast
//import styles from '../styles/testing/TestingPage.module.css';

const TestingPage = () => {
  const showToast = (type) => {
    toast.custom((t) => (
        <Toast
          type={type} // Se pasa el tipo dinámicamente
          title="Mensaje de prueba"
          message="Este es un mensaje de ejemplo"
          onClose={() => toast.dismiss(t.id)}
        />
      ));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Página de Pruebas</h2>
      <button onClick={() => showToast('info')}>Toast de Info</button>
      <button onClick={() => showToast('success')}>Toast de Success</button>
      <button onClick={() => showToast('warning')}>Toast de Warning</button>
      <button onClick={() => showToast('error')}>Toast de Error</button>
      <button onClick={() => showToast('neutral')}>Toast Neutral</button>
      <Toaster position="top-right" />
    </div>
  );
};

export default TestingPage;
