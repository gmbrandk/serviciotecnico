const { parseNombreApellido } = require('@utils/nameParser');
const { randomNumber, smartJoin } = require('@utils/emailHelper');

const dominios = ['gmail.com', 'outlook.com', 'hotmail.com', 'sinemail.com'];

function generarEmailsFicticiosCliente({ nombres, apellidos, nombreCompleto }) {
  const { nombre, apellido } = parseNombreApellido({
    nombres,
    apellidos,
    nombreCompleto,
  });

  const variantes = [
    // inicial + apellido
    `${nombre[0]}${apellido}_${randomNumber(2)}`,
    // nombre + apellido
    smartJoin(nombre, apellido, { sufijoLen: 2, sep: '_' }) + randomNumber(2),
    // nombre.apellido.NNN
    `${nombre}.${apellido}.${randomNumber(3)}`,
  ];

  const variantesUnicas = [...new Set(variantes)];
  const dominiosAleatorios = dominios.sort(() => Math.random() - 0.5);

  return variantesUnicas
    .slice(0, 3)
    .map((v, i) => `${v}@${dominiosAleatorios[i % dominiosAleatorios.length]}`);
}

module.exports = { generarEmailsFicticiosCliente };
