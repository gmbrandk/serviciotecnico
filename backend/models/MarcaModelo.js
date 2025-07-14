// models/MarcaModelo.js
const mongoose = require('mongoose');

const marcaModeloSchema = new mongoose.Schema(
  {
    marca: {
      type: String,
      required: true,
      trim: true,
    },
    modelo: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índice único para evitar duplicados
marcaModeloSchema.index({ marca: 1, modelo: 1 }, { unique: true });

const MarcaModelo = mongoose.model('MarcaModelo', marcaModeloSchema);
module.exports = MarcaModelo;
