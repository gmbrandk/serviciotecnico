const slugify = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .replace(/\s+/g, ' ') // espacios normalizados
    .replace(/[^\w\s.]/g, '') // caracteres raros
    .trim()
    .toLowerCase();

module.exports = slugify;
