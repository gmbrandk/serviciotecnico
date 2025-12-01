// src/utils/normalizarEquipo.js

export function normalizarEquipo(data = {}) {
  if (!data) return {};

  const limpio = { ...data };

  /* ============================================================
     🟦 CASO A → fichaTecnicaManual
     ============================================================ */
  if (data.fichaTecnicaManual) {
    limpio.procesador = data.fichaTecnicaManual.cpu || '';
    limpio.ram = data.fichaTecnicaManual.ram || '';
    limpio.almacenamiento = data.fichaTecnicaManual.almacenamiento || '';
    limpio.gpu = data.fichaTecnicaManual.gpu || '';
  }

  /* ============================================================
     🟩 CASO B → especificacionesActuales
     ============================================================ */
  if (data.especificacionesActuales) {
    const esp = data.especificacionesActuales;

    limpio.procesador = esp.cpu?.valor || limpio.procesador || '';
    limpio.ram = esp.ram?.valor || limpio.ram || '';
    limpio.almacenamiento =
      esp.almacenamiento?.valor || limpio.almacenamiento || '';
    limpio.gpu = esp.gpu?.valor || limpio.gpu || '';
  }

  // Nombre estándar final que usa el formulario
  return {
    ...limpio,
    procesador: limpio.procesador || '',
    ram: limpio.ram || '',
    almacenamiento: limpio.almacenamiento || '',
    gpu: limpio.gpu || '',
  };
}
