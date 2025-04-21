// src/components/Toast.jsx
import React from 'react';
import styles from '../../styles/general/Toast.module.css';

const icons = {
    info: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
      </svg>
    ),
    success: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm-1 14l-4-4 1.41-1.41L11 13.17l6.59-6.59L19 8z" />
      </svg>
    ),
    error: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" fill="currentColor" />
        <path
          d="M8 8L16 16M16 8L8 16"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    warning: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
      </svg>
    ),
    neutral: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
      </svg>
    ),
    close: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  };
  
  const Toast = ({ type = 'info', title, message, onClose }) => {
    const Icon = icons[type] || icons.info;
  
    return (
      <div className={`${styles.toast} ${styles[type]}`}>
        <div className={styles['toast-status-icon']}>
          {Icon}
        </div>
        <div className={styles['toast-content']}>
          <span>{title}</span>
          <p>{message}</p>
        </div>
        <button className={styles['toast-close']} onClick={onClose}>
          {icons.close}
        </button>
        <div className={styles['toast-duration']}></div>
      </div>
    );
  };
  
  export default Toast;