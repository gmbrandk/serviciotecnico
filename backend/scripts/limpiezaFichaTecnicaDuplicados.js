// scripts/limpiarDuplicadosFichaTecnica.js
require('module-alias/register');
const mongoose = require('mongoose');
const FichaTecnica = require('@models/FichaTecnica');
const dotenv = require('dotenv');
const path = require('path');

// Cargar .env adecuado
const envPath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(__dirname, '..', envPath) });

const MONGO_URI = process.env.MONGO_URI;

(async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('🧪 Conectado a MongoDB');

    const duplicados = await FichaTecnica.aggregate([
      {
        $group: {
          _id: '$modelo',
          count: { $sum: 1 },
          dups: { $push: '$_id' },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    let totalEliminados = 0;

    for (const doc of duplicados) {
      const [conservar, ...aEliminar] = doc.dups;

      const resultado = await FichaTecnica.deleteMany({
        _id: { $in: aEliminar },
      });

      console.log(
        `🧹 Modelo: ${doc._id} → Eliminados: ${resultado.deletedCount}`
      );
      totalEliminados += resultado.deletedCount;
    }

    console.log(`✅ Total eliminados: ${totalEliminados}`);
  } catch (err) {
    console.error('❌ Error al limpiar duplicados:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🛑 Conexión cerrada');
  }
})();
