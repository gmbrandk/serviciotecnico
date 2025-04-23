module.exports = ({ solicitante, objetivo }) => {
  if (solicitante.id === objetivo.id) {
    return { permitido: false, mensaje: 'No puedes eliminar tu propia cuenta.' };
  }
  return { permitido: true };
};