// TelefonoField.jsx
import { Input } from '../InputBase';
import { useDropdown } from './useDropdown';
import { useTelefonoInput } from './useTelefonoInput';
import { useTelefonoSync } from './useTelefonoSync';

// IMPORTS CORRECTOS DE UTILIDADES (ajusta la ruta si tu utils está en otra carpeta)
import { buscarPrefijoMasPreciso, limpiarNumero } from './telefonoUtils';

export function TelefonoField({
  value = '',
  onChange,
  locked,
  paisSeleccionado,
  prefijosTelefonicos = [],
  handleSelectPais,
  navHandlers,
  fieldRefs,
  maxLength,
  gridColumn = '1 / 4',
}) {
  const {
    inputRef,
    bandera,
    setBandera,
    displayValue,
    setDisplayValue,
    handleInputChange,
    handleBlur,
  } = useTelefonoInput({
    paisSeleccionado,
    prefijosTelefonicos,
    handleSelectPais,
    onChange,
  });

  const { isOpen, toggle, handleSelect } = useDropdown({
    onSelect: (p) => {
      console.groupCollapsed(
        '%c📍 [Dropdown] País seleccionado',
        'color:#ff9800;'
      );
      console.log('🌎 País:', p.pais);
      console.log('📞 Código:', p.codigo);
      console.log('🏁 Bandera:', p.bandera);
      console.groupEnd();

      // Detectar número actual y quitar prefijo viejo usando el lookup robusto
      const limpio = String(displayValue || '').replace(/\s+/g, '');
      const previo = buscarPrefijoMasPreciso(limpio, prefijosTelefonicos);

      // Si previo existe, limpiamos con su código; si no, limpiamos con el nuevo código seleccionado
      const numeroLocal = previo
        ? limpiarNumero(limpio, previo.codigo)
        : limpiarNumero(limpio, p.codigo);

      // Construir nuevo display sin duplicar prefijos
      const nuevoDisplay = numeroLocal
        ? `${p.codigo} ${numeroLocal}`
        : p.codigo;
      console.log('🧩 Nuevo display por selección:', nuevoDisplay);

      // Aplicar selección (notificar y actualizar bandera/display)
      handleSelectPais(p);
      setBandera(p.bandera);
      setDisplayValue(nuevoDisplay);
    },
  });

  // Sincronización con backend
  useTelefonoSync({
    value,
    paisSeleccionado,
    prefijosTelefonicos,
    setDisplayValue,
    setBandera,
    handleSelectPais,
    inputRef, // 👈 agregado aquí
  });

  // Registrar referencia
  if (fieldRefs?.current) {
    fieldRefs.current['telefono'] = inputRef.current;
  }

  return (
    <div className="telefono-wrapper" style={{ gridColumn }}>
      <div className={`telefono-container ${locked ? 'disabled' : ''}`}>
        <div
          className={`telefono-prefix ${locked ? 'disabled' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!locked) toggle();
          }}
        >
          <img
            src={bandera}
            alt={paisSeleccionado?.pais || 'País'}
            aria-label={`Bandera de ${paisSeleccionado?.pais || 'desconocido'}`}
            role="img"
          />
        </div>

        <Input
          ref={inputRef}
          type="tel"
          value={displayValue || '+51'}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={`${paisSeleccionado?.codigo || '+'}9xxxxxxx`}
          disabled={locked}
          maxLength={maxLength || 20}
          onKeyDown={navHandlers?.generic?.telefono}
          classes={{ input: 'telefono-input' }}
          style={{ border: 'none', background: 'transparent' }}
        />
      </div>

      {isOpen && (
        <div className="telefono-dropdown">
          {prefijosTelefonicos.map((p, i) => (
            <div
              key={`${p.iso}-${i}`}
              className="telefono-item"
              onClick={(e) => {
                console.groupCollapsed(
                  '%c🖱️ [Dropdown.itemClick]',
                  'color:#9c27b0;'
                );
                console.log('Item clickeado:', p);
                console.groupEnd();
                handleSelect(p, e);
              }}
            >
              <img src={p.bandera} alt={p.pais} />
              <span className="telefono-pais">{p.pais}</span>
              <span className="telefono-codigo">{p.codigo}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
