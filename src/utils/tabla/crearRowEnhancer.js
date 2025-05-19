// @utils/tabla/crearRowEnhancer.js

/**
 * Devuelve una función que agrega una propiedad booleana `estaDeshabilitado`
 * basada en el valor de una clave estado (ej. 'estado' === 'inactivo').
 */
export const crearRowEnhancer = ({ claveEstado = 'estado', valorDesactivado = 'inactivo' } = {}) => {
  return (row) => ({
    ...row,
    estaDeshabilitado: row[claveEstado] === valorDesactivado,
  });
};
