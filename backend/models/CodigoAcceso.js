// backend/models/CodigoAcceso.js
const mongoose = require('mongoose');

const codigoAccesoSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
    unique: true,
  },
  usosDisponibles: {
    type: Number,
    default: 1,
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  estado: { 
    type: String, 
    enum: ['activo', 'inactivo'],
    default: 'activo' 
  }, 
  fechaCreacion: { 
    type: Date, 
    default: Date.now 
  } 
});

module.exports = mongoose.model('CodigoAcceso', codigoAccesoSchema);
