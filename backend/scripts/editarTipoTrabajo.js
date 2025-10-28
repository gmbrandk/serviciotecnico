const mongoose = require('mongoose');
const TipoDeTrabajo = require('../models/TipodeTrabajo'); // Ajusta la ruta
// 📁 migrarClienteActual.js
require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env'),
});

// Conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

(async () => {
  await mongoose.connect(MONGODB_URI);

  const updates = {
    'Ventas de Repuesto': {
      descripcion:
        'Venta e instalación de repuestos o componentes electrónicos previa cotización al proveedor.',
      tipo: 'servicio',
      categoria: 'comercial',
      unidadMedida: 'transacción',
      nivelServicio: 'variable',
      flexRange: { min: -0.1, max: 0.25 },
    },
    Formateo: {
      nombre: 'Formateo y reinstalación del sistema operativo',
      descripcion:
        'Instalación de sistema operativo Windows o Linux, drivers y software de ofimática, optimización básica.',
      tipo: 'servicio',
      categoria: 'software',
      unidadMedida: 'equipo',
      nivelServicio: 'básico',
      flexRange: { min: -0.1, max: 0.25 },
    },
    Diagnostico: {
      nombre: 'Diagnóstico técnico integral',
      descripcion:
        'Evaluación funcional de hardware y software, detección de fallas y cotización de reparación.',
      tipo: 'servicio',
      categoria: 'diagnóstico',
      unidadMedida: 'equipo',
      nivelServicio: 'básico',
      flexRange: { min: -0.1, max: 0.25 },
    },
    'Mantenimiento preventivo': {
      nombre: 'Mantenimiento preventivo completo',
      descripcion:
        'Limpieza interna, cambio de pasta térmica, revisión de ventiladores, y pruebas de estabilidad del sistema.',
      tipo: 'servicio',
      categoria: 'mantenimiento',
      unidadMedida: 'equipo',
      nivelServicio: 'estándar',
      flexRange: { min: -0.1, max: 0.25 },
    },
  };

  const now = new Date();

  for (const [nombreActual, nuevosDatos] of Object.entries(updates)) {
    const res = await TipoDeTrabajo.updateOne(
      { nombre: new RegExp(`^${nombreActual}$`, 'i') },
      { $set: { ...nuevosDatos, ultimaActualizacion: now } }
    );
    console.log(
      `✅ Actualizado: ${nombreActual} (${res.modifiedCount} documento modificado)`
    );
  }

  await mongoose.disconnect();
})();
