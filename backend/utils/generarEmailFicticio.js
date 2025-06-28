const slugify = (texto) =>
  texto
    .normalize('NFD') // quitar tildes
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.')
    .replace(/[^\w.]/g, '')
    .toLowerCase();

const generarEmailFicticio = ({ nombre, dni }) => {
  const base = slugify(nombre || 'cliente');
  const id = dni || Math.floor(Math.random() * 100000);
  return `${base}.${id}@sinemail.com`;
};

module.exports = generarEmailFicticio;
