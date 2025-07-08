const mongoose = require('mongoose');

const FichaTecnicaSchema = new mongoose.Schema({
  modelo: String,
  sku: String,
  cpu: String,
  gpu: String,
  ram: String,
  almacenamiento: String,
  pantalla: String,
  fuente: String,
});

module.exports = mongoose.model('FichaTecnica', FichaTecnicaSchema);
