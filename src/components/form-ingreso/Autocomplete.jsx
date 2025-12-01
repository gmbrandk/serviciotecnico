import searchIcon from '../../assets/form-ingreso/search.svg';
import { AutocompleteBase } from '@components/form-ingreso/AutocompleteBase.jsx';

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
  disabled = false, // 👈 NUEVO
}) {
  const handleFocus = () => !disabled && abrirResultados();

  const handleToggle = () => {
    if (disabled) return;
    if (isOpen) cerrarResultados();
    else abrirResultados();
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
      renderIcon={() => <img src={searchIcon} alt="search" />}
      disabled={disabled} // 👈 PASAMOS
    />
  );
}
