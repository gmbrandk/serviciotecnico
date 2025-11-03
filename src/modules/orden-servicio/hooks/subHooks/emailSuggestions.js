import { useEffect, useRef, useState } from 'react';
import { getClienteService } from '../../services/clienteService';

export function useEmailSuggestions({
  clienteInicial,
  handleChangeOrden,
  focusNextField,
}) {
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);
  const [activeEmailIndex, setActiveEmailIndex] = useState(-1);
  const [emailFetched, setEmailFetched] = useState(false);
  const [manualClose, setManualClose] = useState(false);
  const [isFirstFocus, setIsFirstFocus] = useState(true);

  const userInitiatedRef = useRef(false);
  const MANUAL_OPTION = '__manual__';
  const clienteService = getClienteService();

  // 🚀 Genera sugerencias basadas en nombres + apellidos
  const fetchEmailSuggestions = async () => {
    if (!clienteInicial?.nombres || !clienteInicial?.apellidos) return;

    try {
      const res = await clienteService.generarEmails({
        nombres: clienteInicial.nombres,
        apellidos: clienteInicial.apellidos,
      });

      if (res.success) {
        setEmailSuggestions([...(res.details || []), MANUAL_OPTION]);
      } else {
        setEmailSuggestions([]);
        console.error(
          '[useEmailSuggestions] Error generando emails:',
          res.message
        );
      }

      setEmailFetched(true);
      setManualClose(false);
    } catch (err) {
      console.error('[useEmailSuggestions] Error:', err);
    }
  };

  // 🧩 Resetear si cambian los nombres o apellidos
  useEffect(() => {
    if (clienteInicial?.nombres && clienteInicial?.apellidos) {
      setEmailFetched(false);
      if (!clienteInicial._id && clienteInicial.email) {
        handleChangeOrden('cliente', { ...clienteInicial, email: '' });
      }
    } else {
      setEmailSuggestions([]);
    }
  }, [clienteInicial?.nombres, clienteInicial?.apellidos]);

  // 🔹 Foco en email
  const handleEmailFocus = async () => {
    if (isFirstFocus) {
      setIsFirstFocus(false);
    }
    if (!emailFetched) {
      await fetchEmailSuggestions();
    }
    if (emailSuggestions.length > 0) {
      setShowEmailDropdown(true);
    }
  };

  // 🔹 Click en toggle del autocomplete
  const toggleEmailDropdown = async () => {
    if (!emailFetched) {
      await fetchEmailSuggestions();
    }
    setShowEmailDropdown((prev) => !prev);
    setActiveEmailIndex(-1);
  };

  // 🔹 Selección de email
  const handleEmailSelect = (value) => {
    handleChangeOrden('cliente', {
      ...clienteInicial,
      email: value === MANUAL_OPTION ? '' : value,
    });
    setShowEmailDropdown(false);
    setActiveEmailIndex(-1);
    setManualClose(true);
  };

  // 🔹 Blur (pierde foco)
  const handleEmailBlur = () => {
    setTimeout(() => setShowEmailDropdown(false), 150);
  };

  // 🔹 Teclado (Enter / navegación)
  const handleKeyDownEmail = (e) => {
    if (!showEmailDropdown || emailSuggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        focusNextField('email');
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveEmailIndex((prev) => (prev + 1) % emailSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveEmailIndex((prev) =>
        prev <= 0 ? emailSuggestions.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = emailSuggestions[activeEmailIndex] || emailSuggestions[0];
      handleEmailSelect(chosen);
      focusNextField('email');
    } else if (e.key === 'Escape') {
      setShowEmailDropdown(false);
      setActiveEmailIndex(-1);
    }
  };

  return {
    state: { emailSuggestions, showEmailDropdown, activeEmailIndex },
    handlers: {
      handleEmailFocus,
      toggleEmailDropdown,
      handleEmailSelect,
      handleEmailBlur,
      handleKeyDownEmail,
    },
  };
}
