import React from 'react';
import styles from '@styles/ListaCodigosAcceso.module.css'; // Importamos los estilos
import { useCodigosAccesoContext } from '@context/codigoAccesoContext'; // Importar el contexto

const CodigoAccesoItem = ({ id, codigo, usosDisponibles, creadoPor, estado, spotlightActivoId }) => {
    const { reducirUsoCodigo } = useCodigosAccesoContext(); // Usamos la función del contexto

    const handleReducirUso = () => {
        reducirUsoCodigo(codigo); // Llamamos a la función de reducir uso desde el contexto
    };

    return (
        <tr className={`${styles.itemRow} ${id === spotlightActivoId ? styles.spotlight : ''}`}>
            <td data-th="Código de acceso">{codigo}</td>
            <td data-th="Usos disponibles">{usosDisponibles}</td>
            <td data-th="Estado">{estado === 'activo' ? 'Activo' : 'Inactivo'}</td>
            <td data-th="Usuario">{creadoPor}</td>
            <td data-th="Acciones">
                <button
                    className={styles.reduceButton}
                    onClick={handleReducirUso}
                    disabled={estado === 'inactivo' || usosDisponibles <= 0}
                >
                    Reducir Uso
                </button>
            </td>
        </tr>
    );
};

export default CodigoAccesoItem;
