// SelectAutocomplete.jsx
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
}) {
  const handleToggle = () => {
    if (isInitialSelection) return; // No permitir toggle en selección inicial
    isOpen ? cerrarResultados() : abrirResultados();
  };

  const handleFocus = () => {
    if (isInitialSelection) return; // No abrir por focus si la selección es inicial
    abrirResultados();
  };

  // En select solo mostramos resultados cuando el popover está abierto
  const resultadosForSelect = isOpen ? resultados : [];

  return (
    <AutocompleteBase
      label={label}
      placeholder={placeholder}
      query={query}
      onChange={onChange}
      resultados={resultadosForSelect}
      isOpen={isOpen}
      onSelect={onSelect}
      cerrarResultados={cerrarResultados}
      renderItem={renderItem}
      inputName={inputName}
      onFocus={handleFocus}
      onToggle={handleToggle}
      renderIcon={({ isOpen }) => (
        <img
          src={dropdownArrow}
          alt="toggle"
          className={`
            ${autocompleteStyles.autocompleteToggleIcon}
            ${isOpen ? autocompleteStyles.rotated : ''}
          `}
        />
      )}
    />
  );
}
