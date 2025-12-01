// utils/normalizarTecnico.js
// Palabras que suelen aparecer en apellidos compuestos
const PARTICULAS_APELLIDO = new Set([
  'de',
  'del',
  'la',
  'las',
  'los',
  'san',
  'santa',
]);

/** Capitaliza una palabra como "pÉrez" → "Pérez" */
function capitalizarPalabra(w) {
  if (!w) return '';
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
}

/** Capitaliza nombres completos respetando partículas de apellidos */
function capitalizarNombreCompleto(str) {
  if (!str) return '';

  return str
    .split(/\s+/)
    .map((w) => {
      const wl = w.toLowerCase();
      return PARTICULAS_APELLIDO.has(wl) ? wl : capitalizarPalabra(w);
    })
    .join(' ');
}

/** Detecta apellidos compuestos */
function agruparApellidos(partes) {
  let resultado = [];
  let buffer = [];

  for (let p of partes) {
    const l = p.toLowerCase();
    if (PARTICULAS_APELLIDO.has(l)) {
      buffer.push(l);
    } else {
      // si había partículas acumuladas, se unen al apellido
      if (buffer.length > 0) {
        buffer.push(capitalizarPalabra(p));
        resultado.push(buffer.join(' '));
        buffer = [];
      } else {
        resultado.push(capitalizarPalabra(p));
      }
    }
  }

  // Si queda buffer al final (raro)
  if (buffer.length > 0) resultado.push(buffer.join(' '));

  return resultado;
}

export function normalizarTecnico(raw = {}) {
  if (!raw) {
    return {
      _id: null,
      nombres: '',
      apellidos: '',
      nombreCompleto: '',
      role: '',
      email: '',
      telefono: '',
    };
  }

  const backendV2_nombres = raw.nombres ?? null;
  const backendV2_apellidos = raw.apellidos ?? null;
  const backendV1_full = raw.nombre ?? null;

  let nombres = '';
  let apellidos = '';
  let nombreCompleto = '';

  // ============================================================
  // 1️⃣ BACKEND NUEVO → usa nombres/apellidos tal cual
  // ============================================================
  if (backendV2_nombres || backendV2_apellidos) {
    nombres = capitalizarNombreCompleto(backendV2_nombres ?? '');
    apellidos = capitalizarNombreCompleto(backendV2_apellidos ?? '');
    nombreCompleto = `${nombres} ${apellidos}`.trim();
  }

  // ============================================================
  // 2️⃣ BACKEND VIEJO → solo "nombre" → analizador avanzado
  // ============================================================
  else if (backendV1_full) {
    const partesRaw = backendV1_full
      .replace(/[^\p{L}\s'-]/gu, '') // limpia caracteres raros
      .trim()
      .split(/\s+/);

    // Capitalizar y normalizar partículas
    const partes = partesRaw.map((p) => p.trim());

    if (partes.length === 1) {
      // Ej: “Superadmin”
      nombres = capitalizarPalabra(partes[0]);
      apellidos = '';
    } else if (partes.length === 2) {
      // “Carlos Gómez”
      nombres = capitalizarPalabra(partes[0]);
      apellidos = capitalizarPalabra(partes[1]);
    } else {
      // 3–6 palabras → nombres latinos reales
      // Agrupamos apellidos compuestos
      const agrupados = agruparApellidos(partes);

      if (agrupados.length === 2) {
        // Caso limpio → uno o dos nombres + dos apellidos compuestos
        nombres = capitalizarNombreCompleto(
          partes.slice(0, partes.length - 2).join(' ')
        );
        apellidos = `${agrupados[agrupados.length - 2]} ${
          agrupados[agrupados.length - 1]
        }`;
      } else if (agrupados.length >= 3) {
        // Caso extremo de muchos apellidos
        nombres = capitalizarNombreCompleto(
          partes.slice(0, partes.length - 2).join(' ')
        );
        apellidos = capitalizarNombreCompleto(partes.slice(-2).join(' '));
      } else {
        // Fallback general
        const mid = Math.floor(partes.length / 2);
        nombres = capitalizarNombreCompleto(partes.slice(0, mid).join(' '));
        apellidos = capitalizarNombreCompleto(partes.slice(mid).join(' '));
      }
    }

    nombreCompleto = `${nombres} ${apellidos}`.trim();
  }

  return {
    _id: raw._id ?? null,
    nombres,
    apellidos,
    nombreCompleto,
    role: raw.role ?? '',
    email: raw.email ?? '',
    telefono: raw.telefono ?? '',
  };
}
