// scripts/agregarSKUdesdeFicha.js
require('module-alias/register');
const mongoose = require('mongoose');
const Equipo = require('@models/Equipo');
const FichaTecnica = require('@models/FichaTecnica');
require('dotenv').config(); // Asegúrate que .env esté configurado

process.env.MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const agregarSKUaEquipos = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error('❌ No se encontró MONGO_URI en .env');
    }
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('🟢 Conectado a MongoDB');

    const equiposSinSKU = await Equipo.find({
      $or: [{ sku: { $exists: false } }, { sku: null }, { sku: '' }],
      fichaTecnica: { $ne: null },
    }).lean();

    console.log(`🔍 Equipos sin SKU encontrados: ${equiposSinSKU.length}`);

    let actualizados = 0;

    for (const equipo of equiposSinSKU) {
      const ficha = await FichaTecnica.findById(equipo.fichaTecnica);
      if (ficha && ficha.sku) {
        const skuNormalizado = ficha.sku.trim().toUpperCase();
        await Equipo.findByIdAndUpdate(equipo._id, { sku: skuNormalizado });
        console.log(
          `✅ Equipo ${equipo._id} actualizado con SKU: ${skuNormalizado}`
        );
        actualizados++;
      } else {
        console.warn(`⚠️ Ficha técnica no tiene SKU para equipo ${equipo._id}`);
      }
    }

    console.log(`🎉 Total de equipos actualizados: ${actualizados}`);
  } catch (err) {
    console.error('❌ Error durante la actualización:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

agregarSKUaEquipos();
