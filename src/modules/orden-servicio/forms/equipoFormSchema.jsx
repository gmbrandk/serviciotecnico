// forms/equipoFormSchema.js
export function buildEquipoFields({
  equipo = {},
  locked = false,
  nroSerie,
  navigation,
}) {
  if (!nroSerie || !navigation) {
    console.warn('buildEquipoFields: hooks incompletos');
    return [];
  }

  const { state: nroSerieState, handlers: nroSerieHandlers } = nroSerie;
  const { fieldRefs, handlers: navHandlers } = navigation;

  return [
    {
      name: 'nroSerie',
      type: 'autocomplete',

      gridColumn: '1 / 4',

      props: {
        label: { name: 'Nro. Serie', className: 'sr-only' },
        placeholder: 'Ej: 3BO52134Q',
        defaultValue: equipo.nroSerie || '',
        localEditable: true,
        value: nroSerieState.nroSerieBusqueda,
        suggestions: nroSerieState.suggestions,
        showDropdown: nroSerieState.showDropdown,
        activeIndex: nroSerieState.activeIndex,
        onChange: nroSerieHandlers.handleNroSerieChange,
        onSelect: nroSerieHandlers.handleSelectEquipo,
        onKeyDown: nroSerieHandlers.handleKeyDownNroSerie,
        onPointerDown: nroSerieHandlers.handleNroSeriePointerDown,
        onFocus: nroSerieHandlers.handleNroSerieFocus,
        onBlur: nroSerieHandlers.handleNroSerieBlur,
        inputRef: (el) => (fieldRefs.current['nroSerie'] = el),
        renderSuggestion: (eq) => (
          <div className="autocomplete-item">
            <span className="left-span">{eq.nroSerie}</span>
            <span className="right-span">{eq.marca}</span>
            <span className="right-span">{eq.modelo}</span>
          </div>
        ),
      },
    },
    {
      name: 'tipo',
      type: 'text',
      label: { name: 'Tipo', className: 'sr-only' },
      placeholder: 'Ej: Laptop',
      gridColumn: '1 / 4',
      defaultValue: equipo.tipo || '',
      localEditable: !locked,
      onKeyDown: navHandlers.generic?.tipo,
      inputRef: (el) => (fieldRefs.current['tipo'] = el),
      disabled: locked,
    },
    {
      name: 'marca',
      type: 'text',
      label: { name: 'Marca', className: 'sr-only' },
      placeholder: 'Ej: Toshiba',
      gridColumn: '1 / 4',
      defaultValue: equipo.marca || '',
      localEditable: !locked,
      onKeyDown: navHandlers.generic?.marca,
      inputRef: (el) => (fieldRefs.current['marca'] = el),
      disabled: locked,
    },
    {
      name: 'modelo',
      type: 'text',
      label: { name: 'Modelo', className: 'sr-only' },
      placeholder: 'Ej: Satellite L45',
      gridColumn: '1 / 4',
      defaultValue: equipo.modelo || '',
      localEditable: !locked,
      onKeyDown: navHandlers.generic?.modelo,
      inputRef: (el) => (fieldRefs.current['modelo'] = el),
      disabled: locked,
    },
    {
      name: 'sku',
      type: 'text',
      label: { name: 'SKU', className: 'sr-only' },
      placeholder: 'Ej: L45B4205FL',
      gridColumn: '1 / 4',
      defaultValue: equipo.sku || '',
      localEditable: !locked,
      onKeyDown: navHandlers.generic?.sku,
      inputRef: (el) => (fieldRefs.current['sku'] = el),
      disabled: locked,
    },
    {
      name: 'macAddress',
      type: 'text',
      label: { name: 'MAC Address', className: 'sr-only' },
      placeholder: 'Ej: FA:KE:28:08:25:03',
      gridColumn: '1 / 4',
      defaultValue: equipo.macAddress || '',
      localEditable: !locked,
      onKeyDown: navHandlers.generic?.macAddress,
      inputRef: (el) => (fieldRefs.current['macAddress'] = el),
      disabled: locked,
    },
    {
      name: 'especificaciones',
      type: 'checkbox',
      label: { name: 'Agregar especificaciones de equipo' },
      className: 'checkbox-input',
      gridColumn: '1 / 4',
      defaultValue: equipo.especificaciones || false,
      localEditable: !locked,
      inputRef: (el) => (fieldRefs.current['especificaciones'] = el),
      disabled: locked,
    },
  ];
}
