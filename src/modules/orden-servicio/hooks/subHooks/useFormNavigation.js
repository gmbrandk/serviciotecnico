// useFormNavigation.js
import { useCallback, useRef, useState } from 'react';
import { NOMBRES_WHITELIST } from '../../utils/whiteListNombres';

export function useFormNavigation(
  initialOrder = [],
  getFieldValue = () => ({}), // opcional
  getContext = () => ({}) // opcional
) {
  const fieldRefs = useRef({});
  const [fieldOrder, setFieldOrderState] = useState(initialOrder);

  const setFieldOrder = useCallback(
    (newOrder) => {
      const oldOrder = fieldOrder;
      if (
        oldOrder.length !== newOrder.length ||
        oldOrder.some((v, i) => v !== newOrder[i])
      ) {
        setFieldOrderState(newOrder);
      }
    },
    [fieldOrder]
  );

  // 🧾 Función auxiliar: valida si el valor está en la whitelist
  const esNombrePermitido = (valor) => {
    const lower = valor.toLowerCase().trim();
    return NOMBRES_WHITELIST.some((entry) => lower.includes(entry));
  };

  // 🧠 Detección básica de ruido o texto aleatorio
  const detectarRuido = (texto) => {
    const lower = texto.toLowerCase();
    const patrones = [
      /(asd|qwe|zxc|dfg|rty|cvb|poi|lkj|mnb)/,
      /^[a-z]{3,}\s[a-z]{3,}$/i,
      /([a-z]{2,})\1/i, // repite sílabas
    ];
    return patrones.some((p) => p.test(lower));
  };

  // 🚦 Hook opcional de validación antes de pasar al siguiente campo
  const beforeNext = (fieldName) => {
    const ctx = getContext?.() || {};
    const value = getFieldValue?.(fieldName);

    // Validaciones mínimas por tipo de campo
    if (fieldName === 'dni' && (!value || !/^\d{8}$/.test(value))) {
      console.warn('[focusNextField] DNI inválido, no avanza.');
      return false;
    }

    if (
      fieldName === 'email' &&
      value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      console.warn('[focusNextField] Email inválido.');
      return false;
    }

    if (fieldName === 'telefono') {
      const { paisSeleccionado } = ctx;
      if (paisSeleccionado?.longitudEsperada) {
        const expected = paisSeleccionado.longitudEsperada;
        const digits = value?.replace(/\D/g, '') || '';
        if (digits.length !== expected) {
          console.warn(
            `[focusNextField] Teléfono inválido (${digits.length}/${expected})`
          );
          return false;
        }
      }
    }

    // 🧩 Validación avanzada para nombres y apellidos
    if (['nombres', 'apellidos'].includes(fieldName)) {
      const input = (value || '').trim();
      console.log(
        `[VALIDACIÓN ${fieldName}] Iniciando validación con valor: "${input}"`
      );

      // 1️⃣ Validar caracteres permitidos
      const isAlphabetic = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/.test(input);
      console.log(
        `[VALIDACIÓN ${fieldName}] Solo letras y caracteres válidos:`,
        isAlphabetic
      );
      if (!isAlphabetic) {
        console.warn(
          `[focusNextField] ${fieldName} contiene caracteres inválidos.`
        );
        return false;
      }

      // 2️⃣ Longitud mínima y máxima
      const lengthOk = input.length >= 3 && input.length <= 50;
      console.log(
        `[VALIDACIÓN ${fieldName}] Longitud (${input.length}) válida:`,
        lengthOk
      );
      if (!lengthOk) {
        console.warn(`[focusNextField] ${fieldName} demasiado corto o largo.`);
        return false;
      }

      // 3️⃣ Debe tener al menos 2 palabras
      const words = input.split(/\s+/);
      const enoughWords = words.length >= 2;
      console.log(
        `[VALIDACIÓN ${fieldName}] Palabras (${words.length}) suficientes:`,
        enoughWords
      );
      if (!enoughWords) {
        console.warn(
          `[focusNextField] Debe ingresar al menos nombre y apellido.`
        );
        return false;
      }

      // 4️⃣ Detectar palabras repetidas
      const lowerWords = words.map((w) => w.toLowerCase());
      const uniqueWords = new Set(lowerWords);
      const repeatedWords = uniqueWords.size !== lowerWords.length;
      console.log(
        `[VALIDACIÓN ${fieldName}] Palabras repetidas:`,
        repeatedWords
      );

      // Si son repetidas, pero están en whitelist (ej. “José José”), permitirlo
      if (repeatedWords && !esNombrePermitido(input)) {
        console.warn(`[focusNextField] ${fieldName} tiene palabras repetidas.`);
        return false;
      }

      // 5️⃣ Detectar repeticiones de letras o patrones artificiales
      const hasRepetitions = /(.)\1{2,}/.test(input); // 3 o más letras iguales seguidas
      const hasNoisePattern = detectarRuido(input);
      console.log(
        `[VALIDACIÓN ${fieldName}] Repeticiones de letras detectadas:`,
        hasRepetitions
      );
      console.log(
        `[VALIDACIÓN ${fieldName}] Patrón de ruido detectado:`,
        hasNoisePattern
      );

      const permitidoPorWhitelist = esNombrePermitido(input);
      console.log(
        `[VALIDACIÓN ${fieldName}] En whitelist:`,
        permitidoPorWhitelist
      );

      if ((hasRepetitions || hasNoisePattern) && !permitidoPorWhitelist) {
        console.warn(
          `[focusNextField] ${fieldName} parece tener texto no válido o aleatorio.`
        );
        return false;
      }

      console.log(
        `[VALIDACIÓN ${fieldName}] ✅ Validación completada exitosamente.`
      );
    }

    return true;
  };

  // 🚀 Avanzar al siguiente campo si pasa la validación
  const focusNextField = (currentName) => {
    if (!beforeNext(currentName)) return; // 🚫 bloquea si no pasa validación
    const index = fieldOrder.indexOf(currentName);
    if (index >= 0 && index < fieldOrder.length - 1) {
      const nextName = fieldOrder[index + 1];
      const nextField = fieldRefs.current[nextName];
      nextField?.focus();
    }
  };

  const handleGenericKeyDown = (fieldName) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      focusNextField(fieldName);
    }
  };

  const genericHandlers = new Proxy(
    {},
    {
      get: (_, fieldName) => handleGenericKeyDown(fieldName),
    }
  );

  return {
    fieldRefs,
    fieldOrder,
    setFieldOrder,
    focusNextField,
    handlers: { generic: genericHandlers },
  };
}
