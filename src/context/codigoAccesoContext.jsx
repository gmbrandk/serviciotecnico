import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { fetchCodigos } from '@services/codigoAccesoService'; // Importamos el servicio
import { reducirUso } from '@utils/reducirUso'; // Importamos el servicio

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

  const reducirUsoCodigo = (codigoBuscado) => {
    setCodigos(prevCodigos => reducirUso(prevCodigos, codigoBuscado));
  };

  return (
    <CodigosAccesoContext.Provider value={{ 
      codigos, 
      setCodigos,
      reducirUsoCodigo, 
      hayCodigoActivo, 
      loading, 
      setLoading,
      error }}
    >
      {children}
    </CodigosAccesoContext.Provider>
  );
};
