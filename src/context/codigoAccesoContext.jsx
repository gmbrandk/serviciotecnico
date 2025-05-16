import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { fetchCodigos } from '@services/codigoAccesoService'; // Importamos el servicio

const CodigosAccesoContext = createContext();

export const useCodigosAccesoContext = () => {
  return useContext(CodigosAccesoContext);
};

export const CodigosAccesoProvider = ({ children }) => {
  const [codigos, setCodigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar los códigos desde el backend al montar
  useEffect(() => {
    const loadCodigos = async () => {
      try {
        const codigosData = await fetchCodigos();
        setCodigos(codigosData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCodigos();
  }, []);

  const hayCodigoActivo = useMemo(() => {
    return codigos.some(codigo => codigo.estado === 'activo');
  }, [codigos]);

  return (
    <CodigosAccesoContext.Provider value={{ 
      codigos, 
      setCodigos,
      hayCodigoActivo, 
      loading, 
      setLoading,
      error }}
    >
      {children}
    </CodigosAccesoContext.Provider>
  );
};
