import { useMemo, useRef } from 'react';

export function useProgressbarState(activeStep, totalSteps) {
  const prevStepRef = useRef(activeStep);

  // detectar reduce motion
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const states = useMemo(() => {
    const result = Array.from({ length: totalSteps }, (_, idx) => {
      if (prefersReduced) {
        // 🚨 sin animaciones → estado directo
        if (idx < activeStep) return 'completed';
        if (idx === activeStep) return 'active';
        return 'idle';
      } else {
        // 🚀 animaciones con transición
        if (idx < activeStep) return 'completed';
        if (idx === activeStep) return 'active';
        return 'idle';
      }
    });

    // ⚡️ calcular animaciones transitorias
    if (!prefersReduced) {
      const prevStep = prevStepRef.current;

      if (activeStep > prevStep) {
        // se avanzó un paso → animar fill
        result[activeStep] = 'fill-step';
      } else if (activeStep < prevStep) {
        // se retrocedió un paso → animar unfill
        result[prevStep] = 'unfill-step';
      }
    }

    // actualizar referencia para la próxima comparación
    prevStepRef.current = activeStep;

    return result;
  }, [activeStep, totalSteps, prefersReduced]);

  return states;
}
