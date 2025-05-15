// logic/codigos/activarSpotlight.js
export const activarSpotlight = (setSpotlightActivoId, codigoId) => {
  console.log("Activando spotlight con ID:", codigoId);
  setSpotlightActivoId(codigoId);
  setTimeout(() => {
    setSpotlightActivoId(null);
  }, 2500);
};
