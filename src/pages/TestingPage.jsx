// components/CrearCodigo.jsx
import React, { useState } from 'react';
import Spinner from '@components/shared/Spinner';
import styles from '@styles/CrearCodigo.module.css';
import { FiCopy, FiCheck } from 'react-icons/fi';
import useGenerarCodigo from '@hooks/useGenerarCodigo'; // Tu hook
import useGestionarCodigos from '@hooks/useGestionarCodigos'
import useClipboard from '@hooks/useClipboard'; // Nuevo nombre genérico para el hook
import ListaCodigosAcceso from '@components/ListaCodigosAcceso'; // Nuevo componente

const CrearCodigo = () => {
  const { codigo, usosDisponibles, estado, loading, generarCodigo, reducirUsos } = useGenerarCodigo();
  const { copiado, handleCopiar } = useClipboard(codigo);
  const [usosSeleccionados, setUsosSeleccionados] = useState(1);
  const { codigos, reducirUso } = useGestionarCodigos(); // Usamos el hook

  const handleUsosChange = (e) => {
    setUsosSeleccionados(parseInt(e.target.value, 10));
  };

  const handleGenerarCodigo = () => {
    generarCodigo(usosSeleccionados);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Generar Código de Acceso</h1>
      {/* Generar Código de Acceso */}
      <div className={styles.inputGroup}>
        <select
          value={usosSeleccionados}
          onChange={handleUsosChange}
          className={styles.selectUsos}
          disabled={usosDisponibles > 0}
        >
          <option value={1}>1 uso</option>
          <option value={2}>2 usos</option>
          <option value={3}>3 usos</option>
          <option value={4}>4 usos</option>
          <option value={5}>5 usos</option>
        </select>

        <button
          className={styles.generateButton}
          onClick={handleGenerarCodigo}
          disabled={usosDisponibles > 0 || loading}
        >
          {loading ? <Spinner /> : <span className={styles.fadeText}>Generar</span>}
        </button>

        {/* Botón copiar */}
        <div className={styles.inputCopyWrapper}>
          <input value={codigo} placeholder="MUUYJEE7" readOnly disabled className={styles.inputField} />
          <button
            className={styles.copyButton}
            onClick={handleCopiar}
            disabled={!codigo}
            title={copiado ? "¡Copiado!" : "Copiar"}
          >
            {copiado ? <FiCheck className={styles.icon} /> : <FiCopy className={styles.icon} />}
          </button>
        </div>
      </div>

      {/* Estado y usos disponibles */}
      <div className={styles.statusWrapper}>
        <p><strong>Estado del código:</strong> {estado === 'activo' ? 'Activo' : 'Inactivo'}</p>
        <p><strong>Usos disponibles:</strong> {usosDisponibles}</p>
      </div>

      {/* Lista de Códigos de Acceso */}
      <ListaCodigosAcceso codigos={codigos} reducirUso={reducirUso} />
    </div>
  );
};

export default CrearCodigo;
