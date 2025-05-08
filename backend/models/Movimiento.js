const mongoose = require('mongoose');

const movimientoSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['crear', 'editar', 'eliminar', 'login', 'logout', 'otro'],
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
  fecha: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Movimiento', movimientoSchema);
