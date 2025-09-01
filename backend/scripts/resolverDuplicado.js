// scripts/resolverDuplicados.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const { Equipo } = require('../models/Equipo');
const {
  generarSkuTemporal,
  generarNroSerieTemporal,
  generarMacProvisional,
} = require('../utils/generadores/generarIdentificadoresTemporales');
const normalizeField = require('../utils/normalizeField');

const cambios = [];

function generarValorFicticio(campo) {
  switch (campo) {
    case 'skuNormalizado':
      return normalizeField(generarSkuTemporal(), {
        uppercase: true,
        removeNonAlnum: true,
      }).normalizado;
    case 'nroSerieNormalizado':
      return normalizeField(generarNroSerieTemporal(), {
        uppercase: true,
        removeNonAlnum: true,
      }).normalizado;
    case 'imeiNormalizado':
      return normalizeField(
        `TMP-IMEI-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
        { uppercase: true, removeNonAlnum: true }
      ).normalizado;
    case 'macAddressNormalizado':
      return normalizeField(generarMacProvisional(), {
        uppercase: true,
        removeNonAlnum: true,
      }).normalizado;
    default:
      return `TMP-${campo}-${Date.now()}`;
  }
}

async function resolverDuplicadosPorCampo(campo) {
  console.log(`🔎 Buscando duplicados en ${campo}...`);

  const duplicados = await Equipo.aggregate([
    { $match: { [campo]: { $ne: null } } },
    {
      $group: { _id: `$${campo}`, count: { $sum: 1 }, docs: { $push: '$_id' } },
    },
    { $match: { count: { $gt: 1 } } },
  ]);

  for (const dup of duplicados) {
    // dejamos el primero como está, al resto les damos valor ficticio
    const idsModificar = dup.docs.slice(1);

    for (const id of idsModificar) {
      const nuevoValor = generarValorFicticio(campo);
      const eq = await Equipo.findById(id);
      if (eq) {
        eq[campo] = nuevoValor;
        await eq.save();

        cambios.push({
          id,
          campo,
          originalDuplicado: dup._id,
          nuevoValor,
        });

        console.log(
          `⚠️  ${campo} duplicado en equipo ${id}. Reemplazado con ${nuevoValor}`
        );
      }
    }
  }
}

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('❌ No se encontró MONGODB_URI en .env');

    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB');

    const campos = [
      'skuNormalizado',
      'nroSerieNormalizado',
      'imeiNormalizado',
      'macAddressNormalizado',
    ];

    for (const campo of campos) {
      await resolverDuplicadosPorCampo(campo);
    }

    // Guardamos log
    fs.writeFileSync(
      'duplicados_resueltos.json',
      JSON.stringify(cambios, null, 2)
    );
    console.log(
      `📂 Resolución completada. Cambios registrados en duplicados_resueltos.json`
    );

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

run();
