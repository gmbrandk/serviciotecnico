import React, { useState } from 'react';
import Input from '@components/shared/Input'; // Usamos el componente Input genérico
import Spinner from '@components/shared/Spinner'; // Usamos el Spinner genérico
import styles from '@styles/CrearCodigo.module.css';
import { FiCopy, FiCheck } from 'react-icons/fi'; 

const CrearCodigo = () => {
  const [codigo, setCodigo] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerarCodigo = async () => {
    setLoading(true);
    setTimeout(() => {
      const codigoMock = Math.random().toString(36).substring(2, 10).toUpperCase();
      setCodigo(codigoMock);
      setLoading(false);
    }, 1000);
  };

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (error) {
      console.error('Error al copiar', error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Generar Código de Acceso</h1>

      <div className={styles.inputGroup}>
        <button 
          className={styles.generateButton}
          onClick={handleGenerarCodigo}
          disabled={loading}
        >
          {loading ? (
            <Spinner />
          ) : (
            <span className={styles.fadeText}>Generar</span>
          )}
        </button>

        <div className={styles.inputCopyWrapper}>
          <Input value={codigo} placeholder='MUUYJEE7' readOnly disabled />

          <button 
            className={styles.copyButton}
            onClick={handleCopiar}
            disabled={!codigo}
            title={copiado ? "Copiado!" : "Copiar"}
          >
            {copiado ? <FiCheck className={styles.icon} /> : <FiCopy className={styles.icon} />}
          </button>
        </div>
      </div>

      <p className={styles.helperText}>Haz click en "Generar" para obtener un nuevo código</p>
    </div>
  );
};

export default CrearCodigo;
