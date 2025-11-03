// src/components/StepWizardCore.jsx
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { StepWizardContext } from '../context/StepWizardContext';
import { useFramerStepAnimation } from '../logic/useFramerStepAnimation';
import { getClienteService } from '../services/clienteService';
import { ProgressBar } from './Progressbar';

export function StepWizardCore({
  steps,
  onStepSubmit,
  onFinalSubmit,
  getNextLabel,
  getPrevLabel,
  getSubmitLabel,
  onError,
  onSuccess,
}) {
  const [step, setStep] = useState(0);
  const [prevDirection, setPrevDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pendingStep, setPendingStep] = useState(null);

  const providerInfo =
    getClienteService().obtenerNombreProveedor?.() || 'desconocido';
  const providerType = getClienteService().obtenerTipoProveedor?.() || '';

  const fieldsetRef = useRef(null);

  const visibleSteps = steps.filter((s) => !s.hidden);
  const currentStepConfig = visibleSteps[step];
  const StepComponent =
    currentStepConfig?.Component ?? (() => <p>No hay pasos</p>);
  const stepProps = currentStepConfig?.props || {};
  const current = visibleSteps[step];

  console.log(
    '[StepWizardCore] 🔄 visibleSteps:',
    visibleSteps.map((s) => s.id)
  );
  console.log('[StepWizardCore] 🚶 step actual:', step);

  useEffect(() => {
    if (!window.DEBUG_WIZARD) return;
    console.groupCollapsed(
      '%c[DIAG ⚙️ StepWizardCore]',
      'color:#9b59b6;font-weight:bold'
    );
    console.log(
      '🧱 visibleSteps:',
      visibleSteps.map((s) => s.id)
    );
    console.log('🚶 step actual:', current);
    console.log('🔢 totalSteps:', visibleSteps.length);
    console.groupEnd();
  }, [visibleSteps, current]);

  // Auto-focus en cada step
  useEffect(() => {
    if (fieldsetRef.current) {
      const firstInput = fieldsetRef.current.querySelector(
        'input, textarea, select'
      );
      if (firstInput) firstInput.focus();
    }
  }, [step]);

  const goToStep = (newStep, direction) => {
    const target = Math.min(Math.max(newStep, 0), visibleSteps.length - 1);

    if (isAnimating) {
      setPendingStep({ step: target, dir: direction });
      return;
    }

    setIsAnimating(true);
    setPrevDirection(direction);
    setStep(target);

    setTimeout(() => {
      setIsAnimating(false);
      if (pendingStep) {
        const { step: pStep, dir } = pendingStep;
        setPendingStep(null);
        goToStep(pStep, dir);
      }
    }, 650);
  };

  const goPrev = () => goToStep(step - 1, -1);
  const goNext = () => goToStep(step + 1, 1);

  // Validación al avanzar paso
  const handleNext = async () => {
    // 🚫 No ejecutar onStepSubmit si es el paso de "orden-servicio"
    if (current.id === 'orden-servicio') {
      console.log(
        '[Wizard] Ignorando submit parcial del paso "orden-servicio"'
      );
      goNext(); // o simplemente no avanzar, si deseas que quede fijo en este paso
      return;
    }

    const done = await onStepSubmit?.(current);
    if (done?.success) {
      onSuccess?.(done.message || `Paso "${current.title}" completado.`);
      goNext();
    } else if (done?.message) {
      onError?.(done.message);
    } else if (done === false) {
      onError?.('Ocurrió un error en este paso.');
    }
  };

  // Submit final
  const handleFinal = async () => {
    const res = await onFinalSubmit?.();
    if (res?.success) {
      onSuccess?.('Orden de servicio creada correctamente.');
    } else if (res?.message) {
      onError?.(res.message);
    } else if (res === false) {
      onError?.('Error al finalizar la orden de servicio.');
    }
  };

  const variants = useFramerStepAnimation({
    durations: { step: 0.8 },
    debug: false,
  });

  return (
    <StepWizardContext.Provider
      value={{
        step,
        goPrev,
        goNext,
        goToStep,
        handleNext,
        handleFinal,
        isAnimating,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '20px',
          padding: '6px 12px',
          borderRadius: '6px',
          background: providerType === 'mock' ? '#ffe58f' : '#91d5ff',
          color: '#000',
          fontSize: '0.8rem',
          fontWeight: 'bold',
        }}
      >
        {providerInfo} ({providerType})
      </div>

      <div className="form-wrapper">
        <ProgressBar step={step} labels={visibleSteps.map((s) => s.title)} />

        <div className="msform">
          <AnimatePresence mode="sync" initial={false} custom={prevDirection}>
            <motion.fieldset
              key={step}
              ref={fieldsetRef}
              custom={prevDirection}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              layout="position"
            >
              <legend className="sr-only">{visibleSteps[step]?.title}</legend>
              <h2 className="fs-title">{visibleSteps[step]?.title}</h2>
              <h3 className="fs-subtitle">{visibleSteps[step]?.subtitle}</h3>

              <StepComponent {...stepProps} />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                {step > 0 && (
                  <button
                    type="button"
                    className="previous action-button"
                    onClick={goPrev}
                    disabled={isAnimating}
                  >
                    {getPrevLabel ? getPrevLabel(current) : 'Anterior'}
                  </button>
                )}
                {step < visibleSteps.length - 1 ? (
                  <button
                    type="button"
                    className="next action-button"
                    onClick={handleNext}
                    disabled={isAnimating}
                  >
                    {getNextLabel ? getNextLabel(current) : 'Siguiente'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="submit action-button"
                    onClick={handleFinal}
                    disabled={isAnimating}
                  >
                    {getSubmitLabel ? getSubmitLabel(current) : 'Finalizar'}
                  </button>
                )}
              </div>
            </motion.fieldset>
          </AnimatePresence>
        </div>
      </div>
    </StepWizardContext.Provider>
  );
}
