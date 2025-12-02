import { AutocompleteBase } from '@components/form-ingreso/AutocompleteBase.jsx';
import { autocompleteStyles } from '@styles/form-ingreso';
import searchIcon from '../../assets/form-ingreso/search.svg';

export function Autocomplete({
  label,
  placeholder,
  query = '',
  onChange = () => {},
  resultados = [],
  isOpen = false,
  onSelect = () => {},
  cerrarResultados = () => {},
  abrirResultados = () => {},
  renderItem = (item) => item.label ?? item.nombre ?? '',
  inputName = 'autocomplete',
  disabled = false,
}) {
  const handleFocus = () => !disabled && abrirResultados();

  const handleToggle = () => {
    if (disabled) return;
    isOpen ? cerrarResultados() : abrirResultados();
  };

  return (
    <AutocompleteBase
      label={label}
      placeholder={placeholder}
      query={query ?? ''}
      onChange={onChange}
      resultados={resultados ?? []}
      isOpen={isOpen}
      onSelect={onSelect}
      cerrarResultados={cerrarResultados}
      renderItem={renderItem}
      inputName={inputName}
      onFocus={handleFocus}
      onToggle={handleToggle}
      renderIcon={({ isOpen }) => (
        <img
          src={searchIcon}
          alt="search"
          className={`${autocompleteStyles.autocompleteToggleIcon} ${
            isOpen ? autocompleteStyles.rotated : ''
          }`}
        />
      )}
      disabled={disabled}
    />
  );
}
