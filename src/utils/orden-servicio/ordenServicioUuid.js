import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'ordenServicioUuid';

export function getOrCreateOrdenServicioUuid(fromWizard) {
  // 1️⃣ Wizard tiene prioridad absoluta
  if (fromWizard) {
    localStorage.setItem(STORAGE_KEY, fromWizard);
    return fromWizard;
  }

  // 2️⃣ Reutilizar si ya existe (reload, back, etc.)
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return stored;
  }

  // 3️⃣ Crear uno nuevo SOLO si no hay ninguno
  const uuid = uuidv4();
  localStorage.setItem(STORAGE_KEY, uuid);
  return uuid;
}

// 🧹 Llamar SOLO cuando se crea una OS nueva real
export function clearOrdenServicioUuid() {
  localStorage.removeItem(STORAGE_KEY);
}
