import { useState } from 'react';

const useClipboard = (texto) => {
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000); // Resetear después de 2 segundos
    } catch (error) {
      console.error('Error al copiar', error);
    }
  };

  return { copiado, handleCopiar };
};

export default useClipboard;
