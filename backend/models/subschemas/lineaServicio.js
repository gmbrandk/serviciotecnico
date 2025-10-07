const mongoose = require('mongoose');

const LineaServicioSchema = new mongoose.Schema(
  {
    tipoTrabajo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TipoDeTrabajo',
      required: true,
    },
    descripcion: {
      type: String,
      trim: true,
      default: '',
    },
    cantidad: {
      type: Number,
      default: 1,
      min: 1,
    },
    precioUnitario: {
      type: Number,
      required: true,
      min: 0,
    },
    garantiaPersonalizada: {
      duracionDias: {
        type: Number,
        min: 0,
      },
      observacion: {
        type: String,
        trim: true,
      },
    },
  },
  { _id: false }
);

// Virtual: subtotal calculado dinámicamente
LineaServicioSchema.virtual('subtotal').get(function () {
  return this.precioUnitario * this.cantidad;
});

LineaServicioSchema.set('toObject', { virtuals: true });
LineaServicioSchema.set('toJSON', { virtuals: true });

module.exports = LineaServicioSchema;
