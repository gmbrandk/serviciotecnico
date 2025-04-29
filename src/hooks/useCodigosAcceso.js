import { useState, useMemo } from 'react';
import {generateUniqueId} from '@helpers/generateUniqueId';

const useCodigosAcceso = () => {
  const [codigos, setCodigos] = useState([]);

  // Función para generar un código aleatorio
  const generarCodigoAleatorio = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  // Getter: saber si hay algún código activo
  const hayCodigoActivo = useMemo(() => {
    return codigos.some(codigo => codigo.estado === 'activo');
  }, [codigos]);

  // Función para generar un nuevo código
  // useCodigosAcceso.js
  const generarNuevoCodigo = (usos = 1, callback) => {
    if (hayCodigoActivo) return;
  
    const nuevoCodigo = {
      id: generateUniqueId(),
      codigo: generarCodigoAleatorio(),
      usosDisponibles: usos,
      estado: 'activo'
    };
  
    setCodigos(prevCodigos => [nuevoCodigo, ...prevCodigos]);
  
    if (typeof callback === 'function') {
      callback(nuevoCodigo); // ⬅️ Ejecutamos el callback al terminar
    }
  };
  

  // Función para reducir un uso de un código
  const reducirUso = (codigoBuscado) => {
    setCodigos(prevCodigos =>
      prevCodigos.map(item => {
        if (item.codigo === codigoBuscado && item.usosDisponibles > 0) {
          const nuevosUsos = item.usosDisponibles - 1;
          return {
            ...item,
            usosDisponibles: nuevosUsos,
            estado: nuevosUsos === 0 ? 'inactivo' : 'activo'
          };
        }
        return item;
      })
    );
  };

  return {
    codigos,
    generarNuevoCodigo,
    reducirUso,
    hayCodigoActivo
  };
};

export default useCodigosAcceso;
