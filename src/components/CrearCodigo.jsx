import React, { useState, useEffect } from 'react';
import { Tabla } from '@components/shared/Tabla';
import Spinner from '@components/shared/Spinner';
import CopyInput from '@components/shared/CopyInput';
import { useCodigosAccesoContext } from '@context/codigoAccesoContext';
import useClipboard from '@hooks/useClipboard';
import { handleGenerarCodigo } from '@logic/handleGenerarCodigo';
import { activarSpotlight } from '@logic/activarSpotlight';
import styles from '@styles/CrearCodigo.module.css';
import {
  animationSpotlightStyles,
  rwdtableStyles,
  RwdPaginadorStyles,
} from '@styles';
import { columnasCodigos } from '@data/tabla/columnasCodigos';
import { reducirCampoConLimite } from '@utils/reducirValores';
import { crearRowClassNameCallback } from '@utils/tabla/createRowClassNameCallback';
import { crearRowEnhancer } from '@utils/tabla/crearRowEnhancer';
import useEsMovil from '@hooks/useEsMovil';
import PaginadorNumeradoInteligente from '@components/shared/PaginadorNumeradoInteligente'; // ✅ IMPORTACIÓN

const CrearCodigo = () => {
  const { codigos, setCodigos, hayCodigoActivo, loading, setLoading } =
    useCodigosAccesoContext();
  const [usosSeleccionados, setUsosSeleccionados] = useState(1);
  const [spotlightActivoId, setSpotlightActivoId] = useState(null);
  const [botonGenerado, setBotonGenerado] = useState(false);

  const codigoActivo = codigos.find((codigo) => codigo.estado === 'activo');
  const { copiado, handleCopiar } = useClipboard(codigoActivo?.codigo || '');

  const esMovil = useEsMovil();
  const itemsPorPagina = esMovil ? 1 : 6;

  const [paginaActual, setPaginaActual] = useState(1);
  const totalPaginas = Math.ceil(codigos.length / itemsPorPagina);
  const codigosMostrados = codigos.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  useEffect(() => {
    setPaginaActual(1);
  }, [itemsPorPagina]);

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
      setSpotlightActivoId,
    });
  };

  const renderAcciones = (item) => {
    const handleReducir = (id) => {
      setCodigos((prev) =>
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

    return <button onClick={() => handleReducir(item._id)}>➖ Usos</button>;
  };

  const rowEnhancer = crearRowEnhancer({
    claveEstado: 'estado',
    valorDesactivado: 'inactivo',
  });

  const rowClassNameCallback = crearRowClassNameCallback({
    customConditions: [
      {
        condition: (item) => item.id === spotlightActivoId,
        className: 'spotlight',
      },
      {
        condition: (item) => item.estado === 'pendiente',
        className: 'rowPendiente',
      },
      { condition: (item) => item.estaDeshabilitado, className: 'rowDisabled' },
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
            {[1, 2, 3, 4, 5].map((num) => (
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
            {loading ? (
              <Spinner color="#fff" size={20} />
            ) : hayCodigoActivo ? (
              '✔ Generado'
            ) : (
              'Generar'
            )}
          </button>
          <CopyInput
            value={codigoActivo?.codigo || ''}
            onCopy={handleCopiar}
            copiado={copiado}
            disabled={!codigoActivo}
          />
        </div>
      </div>

      <h2>Códigos disponibles</h2>

      {spotlightActivoId && (
        <div
          className={rwdtableStyles.overlay}
          onClick={() => setSpotlightActivoId(null)}
        />
      )}

      <Tabla
        columns={columnasCodigos}
        data={codigosMostrados}
        rowEnhancer={rowEnhancer}
        rowClassNameCallback={rowClassNameCallback}
        estilos={{
          tabla: rwdtableStyles.rwdTable,
          filaAnimacion: animationSpotlightStyles,
        }}
        paginacionInterna={false} // 🚫 apaga la paginación interna
      />

      {totalPaginas > 1 && (
        <PaginadorNumeradoInteligente
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          setPaginaActual={setPaginaActual}
          esMovil={esMovil}
          estilos={RwdPaginadorStyles}
          maxVisible={5}
        />
      )}
    </div>
  );
};

export default CrearCodigo;
