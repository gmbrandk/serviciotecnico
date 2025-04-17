import React from 'react';
import '../../styles/general/AlertMessage.css';

const AlertMessage = ({ type = 'success', message }) => {
  return <div className={`alert-message alert-${type}`}>{message}</div>;
};

export default AlertMessage;
