import React, { useState } from 'react';
import {Tabla} from '@components/shared/Tabla';
import { activarSpotlight } from '@logic/activarSpotlight';
import { datosPrueba, columnas } from '@data/testing/tablaPrueba';
import {animationSpotlightStyles, tableStyles} from '@styles';

const TestingPage = () => {
  const [spotlightActivoId, setSpotlightActivoId] = useState(null);

  const handleAccionPersonalizada = (itemId) => {
    activarSpotlight(setSpotlightActivoId, itemId);
  };

  const rowClassNameCallback = (item) => {
    return item.id === spotlightActivoId ? 'spotlight' : '';
  };

  return (
    <>
      {spotlightActivoId && (
          <div
            className={tableStyles.overlay}
            onClick={() => setSpotlightActivoId(null)}
          ></div>
      )}
      <Tabla
        columns={columnas}
        data={datosPrueba}
        onAccionPersonalizada={handleAccionPersonalizada}
        renderBotonAnimar={(item) => (
          <button
            style={{ marginRight: '5px', background: 'yellow' }}
            onClick={() => handleAccionPersonalizada(item.id)}
          >
            🌟 Resaltar
          </button>
        )}
        renderAcciones={(item) => (
          <>
            <button onClick={() => alert(`Editar ${item.id}`)}>✏️</button>
            <button onClick={() => alert(`Eliminar ${item.id}`)}>🗑️</button>
          </>
        )}
        rowClassNameCallback={rowClassNameCallback}
        rowStyles={animationSpotlightStyles}
        className={tableStyles.rwdTable}
      />
    </>
  );
};

export default TestingPage;
