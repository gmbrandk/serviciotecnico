import { FiCopy, FiCheck } from 'react-icons/fi';
import styles from '@styles/general/CopyInput.module.css';

const CopyInput = ({ value, onCopy, copiado, disabled }) => (
  <div className={styles.inputCopyWrapper}>
    <input
      value={value}
      readOnly
      disabled
      className={styles.inputField}
    />
    <button
      className={styles.copyButton}
      onClick={onCopy}
      disabled={disabled}
      title={copiado ? '¡Copiado!' : 'Copiar'}
    >
      {copiado ? <FiCheck /> : <FiCopy />}
    </button>
  </div>
);

export default CopyInput;
