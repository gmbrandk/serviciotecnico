import React from 'react';
import { TablaAcciones } from '@components/shared/Tabla';
import styles from '../../../styles/animations/Spotlight.module.css'

const TablaBody = ({ data, columns, spotlightActivoId, setSpotlightActivoId }) => {

    // Dispara la animación por 2.5s
  const activarSpotlight = (id) => {
    setSpotlightActivoId(id);
    setTimeout(() => {
      setSpotlightActivoId(null);
    }, 2500);
  };

  return (
    <tbody>
      {data.map((item) => (
        <tr key={item.id}
        className={item.id === spotlightActivoId ? styles.spotlight : ''}>
          {columns.map((col, index) => (
            <td key={index} data-th={col.header}>
              {col.render ? col.render(item[col.accessor], item) : item[col.accessor]}
            </td>
          ))}
          <td>
            {/* Botón que dispara la animación spotlight */}
            <button onClick={() => activarSpotlight(item.id)}>
              🔦 Animar
            </button>
          </td>
          <TablaAcciones item={item} />
        </tr>
      ))}
    </tbody>
  );
};

export default TablaBody;
