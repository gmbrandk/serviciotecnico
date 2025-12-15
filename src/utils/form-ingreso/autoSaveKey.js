export const AUTOSAVE_SCHEMA_VERSION = 'v1';

/**
 * Key legacy (solo OS)
 * formIngreso:{ordenServicioUuid}:v1
 */
export function buildIngresoAutosaveKey(ordenServicioUuid) {
  if (!ordenServicioUuid) return null;
  return `formIngreso:${ordenServicioUuid}:${AUTOSAVE_SCHEMA_VERSION}`;
}

/**
 * ✅ NUEVO: Key scopeada por usuario
 * formIngreso:{userId}:{ordenServicioUuid}:v1
 */
export function buildIngresoAutosaveKeyScoped({ userId, ordenServicioUuid }) {
  if (!userId || !ordenServicioUuid) return null;

  return `formIngreso:${userId}:${ordenServicioUuid}:${AUTOSAVE_SCHEMA_VERSION}`;
}
