import { useState } from 'react';
import prefijosTelefonicos from '../prefixPhoneNumber.json';

export const buildClienteFields = ({
  cliente,
  locked,
  dni,
  email,
  navigation,
}) => {
  if (!dni || !email || !navigation) {
    console.warn('buildClienteFields: hooks incompletos');
    return { fields: [] };
  }

  const { state: dniState, handlers: dniHandlers } = dni;
  const { state: emailState, handlers: emailHandlers } = email;
  const { fieldRefs, handlers: navHandlers } = navigation; // ✅ corregido

  const [paisSeleccionado, setPaisSeleccionado] = useState({
    codigo: '+51',
    bandera: 'https://flagcdn.com/pe.svg',
    iso: 'PE',
    pais: 'Perú',
  });

  const handleSelectPais = (p) => setPaisSeleccionado(p);
  // console.log(
  //   '%c[buildClienteFields] locked →',
  //   'color: orange; font-weight: bold;',
  //   locked
  // );
  const fields = [
    {
      name: 'dni',
      type: 'autocomplete',
      gridColumn: '1 / 4',
      props: {
        label: { name: 'DNI', className: 'sr-only' },
        placeholder: 'Ej: 45591954',
        value: dniState.dniBusqueda,
        suggestions: dniState.suggestions,
        showDropdown: dniState.showDropdown,
        activeIndex: dniState.activeIndex,
        onChange: dniHandlers.handleDniChange,
        onSelect: dniHandlers.handleSelectCliente,
        onKeyDown: dniHandlers.handleKeyDownDni,
        onPointerDown: dniHandlers.handleDniPointerDown,
        onFocus: dniHandlers.handleDniFocus,
        onBlur: dniHandlers.handleDniBlur,
        maxLength: 8,
        inputMode: 'numeric',
        disabled: false,
        inputRef: (el) => (fieldRefs.current['dni'] = el),
        renderSuggestion: (c) => (
          <div className="autocomplete-item">
            <span className="left-span">{c.dni}</span>
            <span className="right-span">
              {c.nombres} {c.apellidos}
            </span>
          </div>
        ),
      },
    },
    {
      name: 'nombres',
      type: 'text',
      placeholder: 'Ej: Adriana Josefina',
      gridColumn: '1 / 4',
      disabled: locked,
      onKeyDown: navHandlers.generic.nombres, // ✅ corregido
      inputRef: (el) => (fieldRefs.current['nombres'] = el),
    },
    {
      name: 'apellidos',
      type: 'text',
      placeholder: 'Ej: Tudela Gutiérrez',
      gridColumn: '1 / 4',
      disabled: locked,
      onKeyDown: navHandlers.generic.apellidos, // ✅ corregido
      inputRef: (el) => (fieldRefs.current['apellidos'] = el),
    },
    {
      name: 'telefono',
      type: 'telefono',
      gridColumn: '1 / 4',
      props: {
        // 👈 agrupas toda la configuración aquí
        locked,
        paisSeleccionado,
        prefijosTelefonicos,
        handleSelectPais,
        navHandlers,
        fieldRefs,
      },
    },
    {
      name: 'email',
      type: 'autocomplete',
      gridColumn: '1 / 4',
      props: {
        label: { name: 'Email', className: 'sr-only' },
        placeholder: 'Ej: ejemplo@correo.com',
        locked,
        suggestions: emailState.emailSuggestions,
        showDropdown: emailState.showEmailDropdown,
        activeIndex: emailState.activeEmailIndex,
        onFocus: emailHandlers.handleEmailFocus,
        onBlur: emailHandlers.handleEmailBlur,
        onKeyDown: emailHandlers.handleKeyDownEmail,
        onSelect: emailHandlers.handleEmailSelect,
        onPointerDown: emailHandlers.toggleEmailDropdown,
        withToggle: true,
        inputRef: (el) => (fieldRefs.current['email'] = el),
        renderSuggestion: (s) =>
          s === '__manual__' ? (
            <em className="email-span">Escribir manualmente</em>
          ) : (
            <span className="email-span">{s}</span>
          ),
      },
    },
    {
      name: 'direccion',
      type: 'text',
      placeholder: 'Ej: Av. Siempre Viva 742',
      gridColumn: '1 / 4',
      disabled: locked,
      onKeyDown: navHandlers.generic.direccion, // ✅ corregido
      inputRef: (el) => (fieldRefs.current['direccion'] = el),
    },
  ];

  return { fields, fieldOrder: fields.map((f) => f.name) };
};
