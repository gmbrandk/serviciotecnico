const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['superadministrador', 'administrador', 'tecnico'],
    default: 'tecnico'
  },
  accessCode: {
    type: String
  },
  activo: { type: Boolean, default: true },  // Nuevo campo para indicar si el usuario está activo
});

usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('Usuario', usuarioSchema);
