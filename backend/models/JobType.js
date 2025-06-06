// 🧰 models/JobType.js
const mongoose = require('mongoose');

const JobTypeSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  tipo: {
    type: String,
    enum: ['mano_obra', 'repuesto', 'diagnostico'],
    required: true,
  },
  precioSugerido: { type: Number, required: true },
  garantiaPorDefecto: {
    duracionDias: { type: Number, default: 0 },
    observacion: { type: String, default: '' },
  },
});

module.exports = mongoose.model('JobType', JobTypeSchema);
