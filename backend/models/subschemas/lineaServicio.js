const mongoose = require('mongoose');

const LineaServicioSchema = new mongoose.Schema(
  {
    tipoTrabajo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TipoDeTrabajo',
      required: true,
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

// Virtual para calcular el subtotal en memoria (no persistente)
LineaServicioSchema.virtual('subtotal').get(function () {
  return this.precioUnitario * this.cantidad;
});

LineaServicioSchema.set('toObject', { virtuals: true });
LineaServicioSchema.set('toJSON', { virtuals: true });

module.exports = LineaServicioSchema;
