// 📁 services/equipos/buscarEquipoPorIdentificador.js
const { Equipo } = require('@models/Equipo');

const buscarEquipoPorIdentificador = async ({ nroSerie, imei, macAddress }) => {
  const query = {};

  if (nroSerie && nroSerie.trim()) {
    query.nroSerie = new RegExp(`^${nroSerie.trim()}$`, 'i'); // exact match case-insensitive
  }
  if (imei && imei.trim()) {
    query.imei = new RegExp(`^${imei.trim()}$`, 'i');
  }
  if (macAddress && macAddress.trim()) {
    query.macAddress = new RegExp(`^${macAddress.trim()}$`, 'i');
  }

  return await Equipo.findOne(query).populate('clienteActual');
};

module.exports = buscarEquipoPorIdentificador;
