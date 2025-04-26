import React from 'react';
import styles from '@styles/general/Input.module.css';

const Input = ({ value, placeholder, readOnly, disabled }) => {
  return (
    <input
      type="text"
      className={styles.input}
      value={value}
      placeholder={placeholder}
      readOnly={readOnly}
      disabled={disabled}
    />
  );
};

export default Input;
