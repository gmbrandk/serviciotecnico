// BotonAccion.jsx
import React from "react";
import styles from "@styles/general/BotonAccion.module.css";
import PropTypes from "prop-types";

const BotonAccion = ({
  texto,
  tipo = "primario", // clases como primario, secundario, peligro, etc.
  onClick,
  icono = null, // ahora espera un <JSX.Element> o null
  className = "", // inyección de clase externa
  disabled = false,
  title = "",
  ...rest // permite props como data-testid, aria-label, etc.
}) => {
  return (
    <button
      className={`${styles.boton} ${styles[tipo]} ${className}`}
      onClick={onClick}
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
  tipo: PropTypes.oneOf(["primario", "secundario", "peligro"]),
  onClick: PropTypes.func,
  icono: PropTypes.element,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  title: PropTypes.string,
};

export default BotonAccion;
