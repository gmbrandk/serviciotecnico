import { AutocompleteBase } from '@components/form-ingreso/AutocompleteBase.jsx';
import dropdownArrow from '../../assets/form-ingreso/dropdown-arrow.svg';

// ⭐ Importar estilos del módulo Autocomplete
import { autocompleteStyles } from '@styles/form-ingreso';

export function SelectAutocomplete({
  label,
  placeholder,
  query,
  onChange,
  resultados,
  isOpen,
  onSelect,
  cerrarResultados,
  renderItem,
  inputName,
  abrirResultados,
  isInitialSelection,
  onFocus, // opcional para pasar hacia AutocompleteBase
  onToggle, // opcional
  renderIcon,
}) {
  // Toggle handler: bloqueado durante selección inicial
  const handleToggle = () => {
    console.debug(`SelectAutocomplete(${inputName}) toggle invoked`, {
      isOpen,
      isInitialSelection,
    });
    if (isInitialSelection) {
      console.debug(
        `SelectAutocomplete(${inputName}) toggle bloqueado por isInitialSelection`
      );
      return; // No permitir toggle en selección inicial
    }
    isOpen ? cerrarResultados() : abrirResultados();
  };

  const handleFocus = (e) => {
    console.debug(`SelectAutocomplete(${inputName}) focus event`, {
      isInitialSelection,
    });
    if (isInitialSelection) {
      console.debug(
        `SelectAutocomplete(${inputName}) focus bloqueado por isInitialSelection`
      );
      return; // No abrir por focus si la selección es inicial
    }
    abrirResultados();
    if (typeof onFocus === 'function') onFocus(e);
  };

  // En select solo mostramos resultados cuando el popover está abierto
  const resultadosForSelect = isOpen ? resultados : [];

  // Log por render para saber contexto
  console.debug(`SelectAutocomplete(${inputName}) RENDER`, {
    label,
    placeholder,
    query,
    isOpen,
    resultadosCount: resultados?.length ?? 0,
    isInitialSelection,
  });

  return (
    <AutocompleteBase
      label={label}
      placeholder={placeholder}
      query={query}
      onChange={(v) => {
        console.debug(`SelectAutocomplete(${inputName}) onChange ->`, { v });
        onChange(v);
      }}
      resultados={resultadosForSelect}
      isOpen={isOpen}
      onSelect={(item) => {
        console.info(
          `SelectAutocomplete(${inputName}) onSelect -> seleccionado`,
          {
            id: item?._id ?? null,
            nombre: item?.nombre,
          }
        );
        onSelect(item);
      }}
      cerrarResultados={() => {
        console.debug(
          `SelectAutocomplete(${inputName}) cerrarResultados called`
        );
        cerrarResultados();
      }}
      renderItem={(item) => {
        // pequeño wrapper para log cuando se renderiza cada item (puede ser ruidoso)
        console.debug(`SelectAutocomplete(${inputName}) renderItem -> item`, {
          id: item?._id ?? null,
          nombre: item?.nombre,
        });
        return renderItem(item);
      }}
      inputName={inputName}
      onFocus={handleFocus}
      onToggle={handleToggle}
      renderIcon={({ isOpen: iconOpen }) => (
        <img
          src={dropdownArrow}
          alt="toggle"
          className={`
            ${autocompleteStyles.autocompleteToggleIcon}
            ${iconOpen ? autocompleteStyles.rotated : ''}
          `}
        />
      )}
    />
  );
}
