// src\utils\orden-servicio\ordenServicioLifeCycle.js
import { AUTOSAVE_SCHEMA_VERSION } from '@utils/form-ingreso/autoSaveKey';
import { clearOrdenServicioUuid } from './ordenServicioUuid';

/**
 * ☠️ Mata completamente una OS local
 * - elimina UUID raíz
 * - elimina autosave
 * - elimina flags relacionados
 */
export function killOrdenServicioLocal({ userId, ordenServicioUuid }) {
  if (!ordenServicioUuid || !userId) return;

  const autosaveKey = `formIngreso:${userId}:${ordenServicioUuid}:${AUTOSAVE_SCHEMA_VERSION}`;

  console.log(
    '%c[OS UUID][KILL]',
    'background:#6b0000;color:#fff;padding:4px;',
    ordenServicioUuid
  );

  // 🔥 Autosave
  localStorage.removeItem(autosaveKey);
  localStorage.removeItem(`${autosaveKey}:enabled`);
  localStorage.removeItem(`${autosaveKey}:lock`);

  // 🔥 UUID raíz
  clearOrdenServicioUuid();
}
