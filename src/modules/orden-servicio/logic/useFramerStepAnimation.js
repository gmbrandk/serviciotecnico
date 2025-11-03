import { useMemo } from 'react';

const easeInOutBack = [0.68, -0.55, 0.27, 1.55]; // curva personalizada
const DEFAULT_DURATION = 1.8;

export function useFramerStepAnimation({
  durations = { step: DEFAULT_DURATION },
  debug = true,
} = {}) {
  // 👀 detecta si el usuario pidió reducir animaciones
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const dur = prefersReduced ? 0 : durations.step;

  return useMemo(() => {
    if (prefersReduced) {
      // 🚨 reduce motion → nada de transforms, todo instantáneo
      return {
        enter: () => ({
          opacity: 1,
          x: 0,
          scale: 1,
          transition: { duration: 0 },
        }),
        center: {
          opacity: 1,
          x: 0,
          scale: 1,
          transition: { duration: 0 },
        },
        exit: () => ({
          opacity: 1,
          x: 0,
          scale: 1,
          transition: { duration: 0 },
        }),
      };
    }

    // 🚀 animación normal
    return {
      enter: (dir) => ({
        opacity: 0,
        x: dir > 0 ? 100 : 0, // NEXT: desde derecha, PREV: desde centro
        scale: dir > 0 ? 1 : 0.8, // NEXT: normal, PREV: crece desde 0.8
        transition: {
          duration: dur,
          ease: easeInOutBack,
        },
      }),

      center: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
          duration: dur,
          ease: easeInOutBack,
        },
      },

      exit: (dir) => ({
        opacity: 0,
        x: dir > 0 ? 0 : 100, // NEXT: centro, PREV: hacia derecha
        scale: dir > 0 ? 0.8 : 1, // NEXT: se encoge, PREV: mantiene tamaño
        transition: {
          duration: dur,
          ease: easeInOutBack,
        },
      }),
    };
  }, [dur, prefersReduced, debug]);
}
