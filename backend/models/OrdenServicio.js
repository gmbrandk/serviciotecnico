// 📋 models/OrdenServicio.js
const mongoose = require('mongoose');

const OrdenServicioSchema = new mongoose.Schema({
  equipo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipo',
    required: true,
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true,
  },
  representante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true,
  },
  tecnico: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  fechaIngreso: { type: Date, default: Date.now },
  defectosReportados: String,
  observaciones: String,
  diagnosticoCliente: String,
  estado: {
    type: String,
    enum: ['pendiente', 'en_proceso', 'finalizado', 'entregado'],
    default: 'pendiente',
  },
  trabajosRealizados: [
    {
      tipoTrabajo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TipoDeTrabajo',
        required: true,
      },
      cantidad: { type: Number, default: 1 },
      precioUnitario: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      garantiaPersonalizada: {
        duracionDias: { type: Number },
        observacion: String,
      },
    },
  ],
  total: { type: Number, required: true },
  estadoFinal: {
    type: String,
    enum: ['reparado', 'no_reparado', 'otro'], // Puedes ajustarlo
  },
  retiroSinReparar: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('OrdenServicio', OrdenServicioSchema);
