// utils/diffLineaServicio.js
export function diffLineaServicio(original, current) {
  const diff = {};

  for (const key of Object.keys(current)) {
    const o = original[key];
    const c = current[key];

    // Comparación profunda SOLO para tipoTrabajo
    if (key === 'tipoTrabajo') {
      const origId = typeof o === 'object' ? o?._id : o;
      const currId = typeof c === 'object' ? c?._id : c;

      if (origId !== currId) diff[key] = c;
      continue;
    }

    // Comparación simple
    if (JSON.stringify(o) !== JSON.stringify(c)) {
      diff[key] = c;
    }
  }

  return diff;
}
