// @components/shared/Botones/BotonAccion.jsx
import React from 'react';
import styles from '@styles/general/BotonAccion.module.css';
import PropTypes from 'prop-types';

const BotonAccion = ({
  texto,
  tipo = 'primario',
  onClick,
  icono = null,
  className = '',
  disabled = false,
  deshabilitadoVisual = false, // Nueva prop para controlar solo el estilo visual
  title = '',
  ...rest
}) => {
  const claseFinal = `
    ${styles.boton}
    ${styles[tipo]}
    ${disabled ? styles.deshabilitado : ''}
    ${deshabilitadoVisual ? styles.deshabilitadoVisual : ''}
    ${className}
  `.trim();

  return (
    <button
      className={claseFinal}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      {...rest}
    >
      {icono && <span className={styles.icono}>{icono}</span>}
      {texto}
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
};

export default BotonAccion;
