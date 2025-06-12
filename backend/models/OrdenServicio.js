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

  estadoOS: {
    type: String,
    enum: ['en_proceso', 'finalizado'],
    default: 'en_proceso',
  },

  estadoEquipo: {
    type: String,
    enum: ['reparado', 'retiro_cliente', 'irreparable'],
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
});

module.exports = mongoose.model('OrdenServicio', OrdenServicioSchema);
