const mongoose = require('mongoose');
const { Schema } = mongoose;

const codigoAccesoSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: v => /^[A-Z0-9]{8}$/.test(v),
      message: props => `${props.value} no es un código válido (8 caracteres hexadecimales en mayúsculas).`
    }
  },
  usosDisponibles: {
    type: Number,
    default: 1,
    min: [0, 'El número mínimo de usos debe ser 0'],
  },
  estado: { 
    type: String, 
    enum: ['activo', 'inactivo'],
    default: 'activo' 
  }, 
  fechaCreacion: { 
    type: Date, 
    default: Date.now 
  },
  creadoPor: {
  type: Schema.Types.ObjectId,
  ref: 'Usuario',
}
});

module.exports = mongoose.model('CodigoAcceso', codigoAccesoSchema);
