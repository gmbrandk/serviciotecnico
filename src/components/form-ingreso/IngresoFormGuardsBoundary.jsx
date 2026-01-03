import ExitConfirmDialog from '@components/navigation/ExitConfirmDialog';
import { useIngresoForm } from '@context/form-ingreso/IngresoFormContext';
import RestoreDraftDialog from './RestoreDraftDialog';

export default function IngresoFormGuardsBoundary({ children }) {
  const {
    showExitDialog,
    stay,
    leaveKeepDraft,
    leaveDiscard,

    showRestoreDialog,
    savedDraft,
    restoreSavedDraft,
    discardSavedDraft,
  } = useIngresoForm();

  return (
    <>
      {children}

      <ExitConfirmDialog
        open={showExitDialog}
        onStay={stay}
        onLeaveKeep={leaveKeepDraft}
        onLeaveDiscard={leaveDiscard}
      />

      <RestoreDraftDialog
        open={showRestoreDialog}
        draft={savedDraft}
        onRestore={restoreSavedDraft}
        onDiscard={discardSavedDraft}
      />
    </>
  );
}
