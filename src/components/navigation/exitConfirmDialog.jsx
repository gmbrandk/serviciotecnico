// src\components\navigation\exitConfirmDialog.jsx
import { buttonsStyles } from '@styles/form-ingreso';
import styles from '@styles/general/ExitConfirmDialog.module.css';

export default function ExitConfirmDialog({
  open,
  onStay,
  onLeaveKeep,
  onLeaveDiscard,
}) {
  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        {/* HEADER */}
        <div className={styles.header}>
          <h3>⚠️ Cambios sin guardar</h3>
          <p>Tienes cambios sin confirmar. ¿Qué deseas hacer?</p>
        </div>

        {/* BODY */}
        <div className={styles.body}>
          Si sales ahora, podrás recuperar el borrador más tarde.
        </div>

        {/* FOOTER */}
        <div className={styles.footer}>
          <button className={buttonsStyles.button} onClick={onStay}>
            ✏️ Seguir editando
          </button>

          <button className={buttonsStyles.actionButton} onClick={onLeaveKeep}>
            🚪 Salir y conservar
          </button>

          <button
            className={buttonsStyles.cancelButton}
            onClick={onLeaveDiscard}
          >
            🗑️ Salir y descartar
          </button>
        </div>
      </div>
    </div>
  );
}
