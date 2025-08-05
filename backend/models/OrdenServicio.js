// models/OrdenServicio.js

const mongoose = require('mongoose');
const LineaServicioSchema = require('./subschemas/lineaServicio');

const OrdenServicioSchema = new mongoose.Schema(
  {
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
    fechaIngreso: {
      type: Date,
      default: Date.now,
    },
    defectosReportados: {
      type: String,
      trim: true,
    },
    observaciones: {
      type: String,
      trim: true,
    },
    diagnosticoCliente: {
      type: String,
      trim: true,
    },
    estadoOS: {
      type: String,
      enum: ['en_proceso', 'finalizado'],
      default: 'en_proceso',
    },
    estadoEquipo: {
      type: String,
      enum: ['reparado', 'retiro_cliente', 'irreparable'],
      required: function () {
        return this.estadoOS === 'finalizado';
      },
    },
    lineasServicio: {
      type: [LineaServicioSchema],
      default: [],
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('OrdenServicio', OrdenServicioSchema);
