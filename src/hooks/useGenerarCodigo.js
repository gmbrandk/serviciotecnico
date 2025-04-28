import { useState } from 'react';

const useGenerarCodigo = () => {
  const [codigo, setCodigo] = useState('');
  const [usosDisponibles, setUsosDisponibles] = useState(0);
  const [estado, setEstado] = useState('inactivo');
  const [loading, setLoading] = useState(false);

  const generarCodigo = async (usos = 5) => {
    setLoading(true);
    setTimeout(() => {
      const nuevoCodigo = Math.random().toString(36).substring(2, 10).toUpperCase();
      setCodigo(nuevoCodigo);
      setUsosDisponibles(usos); 
      setEstado('activo');
      setLoading(false);
    }, 1000);
  };

  const reducirUsos = () => {
    setUsosDisponibles((prevUsos) => {
      const nuevosUsos = prevUsos - 1;
      if (nuevosUsos <= 0) {
        setEstado('inactivo');
      }
      return nuevosUsos;
    });
  };

  return { codigo, usosDisponibles, estado, loading, generarCodigo, reducirUsos };
};

export default useGenerarCodigo;
