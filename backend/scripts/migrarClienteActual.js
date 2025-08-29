// 📁 migrarClienteActual.js
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

// Conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

const EquipoSchema = new mongoose.Schema(
  {},
  { strict: false, collection: 'equipos' }
);
const Equipo = mongoose.model('Equipo', EquipoSchema);

const run = async () => {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);

    console.log('🔍 Buscando equipos con clienteActual como objeto...');
    const equipos = await Equipo.find({
      'clienteActual._id': { $exists: true },
    });

    console.log(`Encontrados ${equipos.length} equipos a normalizar`);

    let count = 0;
    for (const eq of equipos) {
      const clienteId = eq.clienteActual?._id;
      if (clienteId) {
        await Equipo.updateOne(
          { _id: eq._id },
          { $set: { clienteActual: clienteId } }
        );
        count++;
        console.log(
          `✅ Normalizado equipo ${eq._id} → clienteActual: ${clienteId}`
        );
      }
    }

    console.log(`🎉 Migración completada. Total normalizados: ${count}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en migración:', err);
    process.exit(1);
  }
};

run();
