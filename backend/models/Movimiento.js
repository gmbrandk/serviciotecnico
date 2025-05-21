const mongoose = require('mongoose');
const TIPOS_MOVIMIENTO = require('../utils/constantes/tiposMovimiento');

const movimientoSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: Object.values(TIPOS_MOVIMIENTO),
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
  entidad: {
    type: String,
    required: true,
  },
  entidadId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  realizadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  usadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: false,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Movimiento', movimientoSchema);
