import React, { useState } from 'react';
import { Tabla } from '@components/shared/Tabla';
import Spinner from '@components/shared/Spinner';
import CopyInput from '@components/shared/CopyInput';
import { useCodigosAccesoContext } from '@context/codigoAccesoContext';
import useClipboard from '@hooks/useClipboard';
import { handleGenerarCodigo } from '@logic/handleGenerarCodigo';
import { activarSpotlight } from '@logic/activarSpotlight';
import styles from '@styles/CrearCodigo.module.css';
import { animationSpotlightStyles, rwdtableStyles } from '@styles';
import { columnasCodigos } from '@data/tabla/columnasCodigos';
import { reducirCampoConLimite } from '@utils/reducirValores';
import { crearRowClassNameCallback } from '@utils/tabla/createRowClassNameCallback';
import { crearRowEnhancer } from '@utils/tabla/crearRowEnhancer';

const CrearCodigo = () => {
  const { codigos, setCodigos, hayCodigoActivo, loading, setLoading } = useCodigosAccesoContext();
  const [usosSeleccionados, setUsosSeleccionados] = useState(1);
  const [spotlightActivoId, setSpotlightActivoId] = useState(null);
  const [botonGenerado, setBotonGenerado] = useState(false);

  const codigoActivo = codigos.find(codigo => codigo.estado === 'activo');
  const { copiado, handleCopiar } = useClipboard(codigoActivo?.codigo || '');

  const generarCodigo = () => {
    if (loading) return;
    handleGenerarCodigo({
      hayCodigoActivo,
      codigos,
      setCodigos,
      setBotonGenerado,
      startLoading: () => setLoading(true),
      stopLoading: () => setLoading(false),
      usosSeleccionados,
      activarSpotlight,
      setSpotlightActivoId
    });
  };

  const renderAcciones = (item) => {
    const handleReducir = (id) => {
      setCodigos(prev =>
        reducirCampoConLimite({
          lista: prev,
          identificadorBuscado: id,
          claveIdentificador: '_id',
          claveCantidad: 'usosDisponibles',
          valorLimite: 0,
          actualizarEstado: true,
          clavesEstado: {
            activo: 'activo',
            inactivo: 'inactivo',
          },
        })
      );
    };

    return (
      <button onClick={() => handleReducir(item._id)}>
        ➖ Usos
      </button>
    );
  };

  const rowEnhancer = crearRowEnhancer({ claveEstado: 'estado', valorDesactivado: 'inactivo' });

  const rowClassNameCallback = crearRowClassNameCallback({
    customConditions: [
      { condition: (item) => item.id === spotlightActivoId, className: 'spotlight' },
      { condition: (item) => item.estaDeshabilitado, className: 'rowDisabled' },
      { condition: (item) => item.estado === 'pendiente', className: 'rowPendiente' },
    ],
  });


  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Generar Código de Acceso</h1>
      <div className={styles.inputGroup}>
        <div className={styles.generateComponent}>
          <select
            value={usosSeleccionados}
            onChange={(e) => setUsosSeleccionados(parseInt(e.target.value, 10))}
            className={styles.selectUsos}
            disabled={hayCodigoActivo}
          >
            {[1, 2, 3, 4, 5].map(num => (
              <option key={num} value={num}>
                {num} uso{num > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.generateComponent}>
          <button
            className={`${styles.generateButton} 
              ${loading ? styles.loading : ''} 
              ${hayCodigoActivo ? styles.disabled : ''}`}
            onClick={generarCodigo}
          >
            {loading ? <Spinner color="#fff" size={20} /> : hayCodigoActivo ? '✔ Generado' : 'Generar'}
          </button>
          <CopyInput
            value={codigoActivo?.codigo || ''}
            onCopy={handleCopiar}
            copiado={copiado}
            disabled={!codigoActivo}
          />
        </div>
      </div>

      <h2>Codigos disponibles</h2>

      {spotlightActivoId && (
        <div
          className={rwdtableStyles.overlay}
          onClick={() => setSpotlightActivoId(null)}
        />
      )}

      <Tabla
        columns={columnasCodigos}
        data={codigos}
        rowEnhancer={rowEnhancer}
        rowClassNameCallback={rowClassNameCallback}
        rowClassMap ={animationSpotlightStyles}
        //renderAcciones={renderAcciones}
        className={rwdtableStyles.rwdTable}
      />
    </div>
  );
};

export default CrearCodigo;
