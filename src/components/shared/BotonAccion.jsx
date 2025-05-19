import React from 'react';
import styles from './BotonAccion.module.css';
import { Pencil, Trash2 } from 'lucide-react';

const iconos = {
  editar: <Pencil size={16} />,
  eliminar: <Trash2 size={16} />,
};

const BotonAccion = ({ texto, tipo = 'primario', onClick, icono }) => {
  return (
    <button className={`${styles.boton} ${styles[tipo]}`} onClick={onClick}>
      {icono && <span className={styles.icono}>{iconos[icono]}</span>}
      {texto}
    </button>
  );
};

export default BotonAccion;
