import React from 'react';
import styles from '@styles/general/Spinner.module.css';

const Spinner = () => {
  return (
    <svg
      className={`${styles.spinner} ${styles.fadeIn}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 50"
    >
      <circle
        className={styles.path}
        cx="25"
        cy="25"
        r="20"
        fill="none"
        strokeWidth="5"
      />
    </svg>
  );
};

export default Spinner;
