// src/context/StepWizardContext.jsx
import { createContext, useContext } from 'react';

/**
 * Contexto para manejar la navegación y animación del StepWizard.
 * Expone funciones como goPrev, goNext, handleFinal, etc.
 */
export const StepWizardContext = createContext(null);

export const useStepWizard = () => {
  const ctx = useContext(StepWizardContext);
  if (!ctx) {
    throw new Error('useStepWizard debe usarse dentro de <StepWizardProvider>');
  }
  return ctx;
};
