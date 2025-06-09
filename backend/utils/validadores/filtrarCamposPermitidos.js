// utils/filtrarCamposPermitidos.js

const filtrarCamposPermitidos = (data, camposPermitidos = []) => {
  const resultado = {};
  for (const key of camposPermitidos) {
    if (data.hasOwnProperty(key)) {
      resultado[key] = data[key];
    }
  }
  return resultado;
};

module.exports = filtrarCamposPermitidos;
