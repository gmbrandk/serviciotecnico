export const handleGenerarCodigo = ({
  hayCodigoActivo,
  codigoActivo,
  startLoading,
  stopLoading,
  generarNuevoCodigo,
  usosSeleccionados,
  activarSpotlight,
  setBotonGenerado,
  setSpotlightActivoId,
}) => {
  if (hayCodigoActivo && codigoActivo?.id) {
    activarSpotlight(setSpotlightActivoId, codigoActivo.id);
    return;
  }

  // 🧾 Log antes de enviar los datos
  const nuevoCodigoPayload = {
    usos: usosSeleccionados,
    creadoEn: new Date().toISOString(),
    generadoPor: 'usuario_logueado_placeholder', // Puedes reemplazarlo con el ID del usuario autenticado
  };

  console.log('📤 Enviando nuevo código a la base de datos:', nuevoCodigoPayload);

  startLoading();
  generarNuevoCodigo(usosSeleccionados, () => {
    setBotonGenerado(true);
  });

  setTimeout(() => stopLoading(), 500);
};
