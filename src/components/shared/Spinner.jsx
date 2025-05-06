import React from 'react';
import styles from '@styles/general/Spinner.module.css';

const Spinner = ({ color = '#007bff', size = 40 }) => {
  return (
    <svg
      className={`${styles.spinner} ${styles.fadeIn}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 50"
      width={size}
      height={size}
    >
      <circle
        className={styles.path}
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke={color}       
        strokeWidth="5"
      />
    </svg>
  );
};

export default Spinner;
