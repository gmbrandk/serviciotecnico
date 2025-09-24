// ---- CLIENTES ----

function maskPartialWord(word = '') {
  if (!word) return '';
  if (word.length <= 2) {
    return word[0] + '*'.repeat(Math.max(0, word.length - 1));
  }
  return word.slice(0, 2) + '*'.repeat(word.length - 2);
}

function maskNames(nombres = '') {
  if (!nombres) return '';
  const parts = nombres.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0]; // un solo nombre → se deja completo
  }

  // primer nombre completo, segundo parcial, el resto tal cual
  return [parts[0], maskPartialWord(parts[1]), ...parts.slice(2)].join(' ');
}

function maskApellidos(apellidos = '') {
  if (!apellidos) return '';
  const parts = apellidos.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0]; // un solo apellido → se deja completo
  }

  // primer apellido completo, segundo parcial, el resto tal cual
  return [parts[0], maskPartialWord(parts[1]), ...parts.slice(2)].join(' ');
}

function maskDni(dni) {
  if (!dni) return '';
  const s = String(dni);
  if (s.length <= 2) return '*'.repeat(s.length);
  return '*'.repeat(Math.max(0, s.length - 2)) + s.slice(-2);
}

function maskPhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return '*'.repeat(digits.length);
  return (
    digits.slice(0, digits.length - 4).replace(/\d/g, '*') + digits.slice(-4)
  );
}

function maskEmail(email) {
  if (!email) return '';
  const [user, domain] = email.split('@');
  if (!domain) return '****';
  const visible =
    user?.length > 2
      ? user[0] + '*****' + user.slice(-1)
      : user
      ? user[0] + '****'
      : '****';
  return `${visible}@${domain}`;
}

// ---- EQUIPOS ----
// Oculta todo menos los últimos N caracteres
function maskSensitive(value, visible = 4) {
  if (!value) return '';
  const str = String(value);
  if (str.length <= visible) return '*'.repeat(str.length);
  return '*'.repeat(str.length - visible) + str.slice(-visible);
}

module.exports = {
  // clientes
  maskDni,
  maskPhone,
  maskEmail,
  maskNames,
  maskApellidos,

  // equipos
  maskSensitive,
};
