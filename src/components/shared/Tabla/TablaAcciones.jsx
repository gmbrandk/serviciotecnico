import React from 'react';

const TablaAcciones = ({ item }) => {
  return (
    <td>
      <button onClick={() => alert(`Editar ${item.id}`)}>Editar</button>
      <button onClick={() => alert(`Eliminar ${item.id}`)}>Eliminar</button>
    </td>
  );
};

export default TablaAcciones;
