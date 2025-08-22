// utils/masking.js
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

module.exports = { maskDni, maskPhone, maskEmail };
