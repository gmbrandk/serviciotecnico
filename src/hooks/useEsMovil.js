// hooks/useEsMovil.js
import { useState, useEffect } from 'react';

const useEsMovil = (breakpoint = 480) => {
  const [esMovil, setEsMovil] = useState(window.innerWidth <= breakpoint);

  useEffect(() => {
    const manejarResize = () => {
      setEsMovil(window.innerWidth <= breakpoint);
    };
    window.addEventListener('resize', manejarResize);
    return () => window.removeEventListener('resize', manejarResize);
  }, [breakpoint]);

  return esMovil;
};

export default useEsMovil;
