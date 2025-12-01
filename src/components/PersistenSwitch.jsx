import { useIngresoForm } from '@context/form-ingreso/IngresoFormContext';

export function PersistSwitch() {
  const { persistEnabled, setPersistEnabled } = useIngresoForm();
  return (
    <label style={{ display: 'flex', gap: 8 }}>
      <input
        type="checkbox"
        checked={persistEnabled}
        onChange={(e) => setPersistEnabled(e.target.checked)}
      />
      Guardar progreso automáticamente
    </label>
  );
}
