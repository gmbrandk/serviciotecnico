export function formatValue(v) {
  if (v === null || v === undefined || v === '') return '—';

  if (typeof v === 'object') {
    if (v.nombre) return v.nombre;
    if (v.dni) return `DNI ${v.dni}`;
    return JSON.stringify(v);
  }

  return String(v);
}
