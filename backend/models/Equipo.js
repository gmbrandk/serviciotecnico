// 💻 models/Equipo.js
const mongoose = require('mongoose');

const EquipoSchema = new mongoose.Schema({
  tipo: { type: String, required: true }, // laptop, pc, impresora, etc.
  marca: String,
  modelo: String,
  nroSerie: { type: String, unique: true },
  clienteActual: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true,
  },
  historialClientes: [
    {
      clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
      fechaAsignacion: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model('Equipo', EquipoSchema);
