// hooks/useGestionarCodigos.js
import { useState } from 'react';

const useGestionarCodigos = () => {
  const [codigos, setCodigos] = useState([
    { codigo: 'AB1234', usosDisponibles: 3, estado: 'activo' },
    { codigo: 'XY5678', usosDisponibles: 0, estado: 'inactivo' },
    { codigo: 'CD9101', usosDisponibles: 0, estado: 'inactivo' },
  ]);

  const reducirUso = (codigo) => {
    setCodigos(prevCodigos => 
      prevCodigos.map(item => 
        item.codigo === codigo && item.usosDisponibles > 0
          ? { ...item, usosDisponibles: item.usosDisponibles - 1 }
          : item
      )
    );
  };

  return { codigos, reducirUso };
};

export default useGestionarCodigos;
