function randomNumber(digits = 2) {
  return Math.floor(Math.random() * Math.pow(10, digits))
    .toString()
    .padStart(digits, '0');
}

/**
 * Une nombre + apellido asegurando máximo de caracteres
 */
function smartJoin(nombre, apellido, opts = {}) {
  const { maxLen = 25, sufijoLen = 3, sep = '_' } = opts;
  const presupuesto = maxLen - (sep.length + sufijoLen);

  if (presupuesto <= 2) {
    return nombre[0] + apellido[0]; // fallback mínimo
  }

  let nombreCap = Math.max(1, Math.round(presupuesto * 0.45));
  let apellidoCap = presupuesto - nombreCap;

  if (apellidoCap < 1) {
    apellidoCap = 1;
    nombreCap = presupuesto - 1;
  }

  const nombreTrunc = nombre.slice(0, nombreCap);
  const apellidoTrunc = apellido.slice(0, apellidoCap);

  return `${nombreTrunc}${sep}${apellidoTrunc}`;
}

module.exports = { randomNumber, smartJoin };
