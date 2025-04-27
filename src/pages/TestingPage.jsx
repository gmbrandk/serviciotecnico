import React, { useState } from 'react';
import Input from '@components/shared/Input';
import Spinner from '@components/shared/Spinner';
import styles from '@styles/CrearCodigo.module.css';
import { FiCopy, FiCheck } from 'react-icons/fi'; 

const CrearCodigo = () => {
  const [codigo, setCodigo] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usos, setUsos] = useState(1);

  const handleUsosChange = (event) => {
    setUsos(parseInt(event.target.value, 10));
  };

  const handleGenerarCodigo = async () => {
    if (![1, 2, 3, 4, 5].includes(usos)) {
      alert('Selecciona un número de usos válido (1 a 5)');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const codigoMock = Math.random().toString(36).substring(2, 10).toUpperCase();
      setCodigo(codigoMock);

       // Aquí se puede ver el código ya actualizado
      console.log('Datos que se enviarían al backend:', { codigo: codigoMock, usos });

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
        {/* Select para seleccionar la cantidad de usos */}
        <select
          value={usos}
          onChange={handleUsosChange}
          className={styles.selectUsos}
        >
          <option value="1">1 uso</option>
          <option value="2">2 usos</option>
          <option value="3">3 usos</option>
          <option value="4">4 usos</option>
          <option value="5">5 usos</option>
        </select>

        <button 
          className={`${styles.generateButton} ${codigo !== '' ? styles.disabledButton : ''}`} // Agregar la clase 'disabledButton' si ya hay un código
          onClick={handleGenerarCodigo}
          disabled={loading || codigo !== ''} // Deshabilitar si ya hay un código
        >
          {loading ? (
            <Spinner />
          ) : (
            <span className={styles.fadeText}>Generar</span>
          )}
        </button>

        <div className={styles.inputCopyWrapper}>
          <Input value={codigo} placeholder="MUUYJEE7" readOnly disabled />

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
