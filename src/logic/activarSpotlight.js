// logic/codigos/activarSpotlight.js
export const activarSpotlight = (setSpotlightActivoId, codigoId) => {
  setSpotlightActivoId(codigoId);
  setTimeout(() => {
    setSpotlightActivoId(null);
  }, 2500);
};
