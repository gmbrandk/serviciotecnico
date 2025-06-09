// utils/validarCamposPermitidos.js

const validarCamposPermitidos = (data, camposPermitidos = []) => {
  const enviados = Object.keys(data);
  const camposInvalidos = enviados.filter(
    (key) => !camposPermitidos.includes(key)
  );
  return camposInvalidos;
};

module.exports = validarCamposPermitidos;
