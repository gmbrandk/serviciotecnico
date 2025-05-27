import React from 'react';
import PropTypes from 'prop-types';
import Spinner from '@components/shared/Spinner';
import styles from '@styles/general/BotonAccion.module.css';

const BotonAccion = ({
  texto,
  tipo = 'primario',
  onClick,
  icono = null,
  className = '',
  disabled = false,
  deshabilitadoVisual = false,
  title = '',
  cargando = false, // ✅ NUEVA PROP
  ...rest
}) => {
  const claseFinal = `
    ${styles.boton}
    ${styles[tipo]}
    ${disabled || cargando ? styles.deshabilitado : ''}
    ${deshabilitadoVisual ? styles.deshabilitadoVisual : ''}
    ${className}
  `.trim();

  return (
    <button
      className={claseFinal}
      onClick={disabled || cargando ? undefined : onClick}
      disabled={disabled || cargando}
      title={title}
      {...rest}
    >
      {cargando ? (
        <Spinner size={45} color="#fff" /> // ajusta color según fondo si deseas
      ) : (
        <>
          {icono && <span className={styles.icono}>{icono}</span>}
          {texto}
        </>
      )}
    </button>
  );
};

BotonAccion.propTypes = {
  texto: PropTypes.string.isRequired,
  tipo: PropTypes.oneOf(['primario', 'secundario', 'peligro']),
  onClick: PropTypes.func,
  icono: PropTypes.element,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  deshabilitadoVisual: PropTypes.bool,
  title: PropTypes.string,
  cargando: PropTypes.bool, // ✅ NUEVA PROP
};

export default BotonAccion;
