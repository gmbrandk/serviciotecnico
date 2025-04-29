import { useEffect } from 'react';

const useResetBotonGenerado = (codigos, setBotonGenerado) => {
  useEffect(() => {
    const hayActivos = codigos.some(c => c.estado === 'activo');
    if (!hayActivos) {
      setBotonGenerado(false);
    }
  }, [codigos]);
};

export default useResetBotonGenerado;
