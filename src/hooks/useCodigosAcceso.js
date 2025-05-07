import { useState, useEffect, useMemo } from 'react';

const useCodigosAcceso = () => {
  const [codigos, setCodigos] = useState([]); // Asegúrate de que esto sea un array vacío
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar los códigos desde el backend al montar
  useEffect(() => {
    const fetchCodigos = async () => {
      try {
        // El token se obtiene automáticamente de la cookie HttpOnly
        const response = await fetch('http://localhost:5000/api/codigos', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Esto enviará la cookie automáticamente
        });

        const data = await response.json();
        console.log('Codigos desde backend:', data.codigos);
        if (!response.ok) {
          throw new Error(data.mensaje || 'Error al cargar los códigos');
        }

        setCodigos(data.codigos || []);  // Asegúrate de que los datos siempre sean un array
      } catch (err) {
        console.error('Error al obtener códigos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCodigos();
  }, []);

  // Saber si hay código activo
  const hayCodigoActivo = useMemo(() => {
    return codigos && codigos.some(codigo => codigo.estado === 'activo'); // Verificar si codigos no es undefined
  }, [codigos]);

  // Reducir un uso
  const reducirUso = (codigoBuscado) => {
    setCodigos(prev =>
      prev.map(item => {
        if (item.codigo === codigoBuscado && item.usosDisponibles > 0) {
          const nuevosUsos = item.usosDisponibles - 1;
          return {
            ...item,
            usosDisponibles: nuevosUsos,
            estado: nuevosUsos === 0 ? 'inactivo' : 'activo',
          };
        }
        return item;
      })
    );
  };

  return {
    codigos,
    setCodigos,
    reducirUso,
    hayCodigoActivo,
    loading,
    error,
  };
};

export default useCodigosAcceso;
