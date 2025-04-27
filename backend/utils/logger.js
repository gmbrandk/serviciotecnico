// utils/logger.js
const logError = (error) => {
    if (process.env.NODE_ENV === 'production') {
      console.error(error);
    } else {
      // En test o desarrollo puedes decidir no mostrarlo
      console.log('[ERROR capturado]:', error.message || error);
    }
  };
  
  module.exports = { logError };
  