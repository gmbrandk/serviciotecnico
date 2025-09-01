// scripts/migrarNormalizados.js
require('dotenv').config({ path: __dirname + '/../.env' });

const mongoose = require('mongoose');
const { Equipo } = require('../models/Equipo');
const normalizeField = require('../utils/normalizeField');
const {
  generarSkuTemporal,
  generarNroSerieTemporal,
  generarMacProvisional,
} = require('../utils/generadores/generarIdentificadoresTemporales');

async function runMigration() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('❌ No se encontró MONGODB_URI en el archivo .env');
  }

  await mongoose.connect(uri);
  console.log('✅ Conectado a MongoDB');

  const equipos = await Equipo.find({});
  console.log(`📦 Equipos encontrados: ${equipos.length}`);

  for (const equipo of equipos) {
    try {
      // --- Normalizar SKU ---
      let { normalizado: skuNorm } = normalizeField(equipo.sku, {
        uppercase: true,
      });
      if (!skuNorm) {
        const tmpSku = generarSkuTemporal();
        console.log(
          `⚠️  Asignando SKU temporal a equipo ${equipo._id}: ${tmpSku}`
        );
        equipo.sku = tmpSku;
        skuNorm = tmpSku.toUpperCase();
      }

      // si ya existe otro con el mismo skuNormalizado → forzar TMP
      const skuDuplicado = await Equipo.findOne({
        _id: { $ne: equipo._id },
        skuNormalizado: skuNorm,
      });
      if (skuDuplicado) {
        const tmpSku = generarSkuTemporal();
        console.log(
          `⚠️  Colisión de SKU detectada en ${equipo._id}, asignando temporal: ${tmpSku}`
        );
        equipo.sku = tmpSku;
        skuNorm = tmpSku.toUpperCase();
      }
      equipo.skuNormalizado = skuNorm;

      // --- Normalizar nroSerie ---
      let { normalizado: serieNorm } = normalizeField(equipo.nroSerie, {
        uppercase: true,
      });
      if (!serieNorm) {
        const tmpSerie = generarNroSerieTemporal();
        console.log(
          `⚠️  Asignando nroSerie temporal a ${equipo._id}: ${tmpSerie}`
        );
        equipo.nroSerie = tmpSerie;
        serieNorm = tmpSerie.toUpperCase();
      }
      equipo.nroSerieNormalizado = serieNorm;

      // --- Normalizar IMEI ---
      let { normalizado: imeiNorm } = normalizeField(equipo.imei, {
        uppercase: true,
      });
      equipo.imeiNormalizado = imeiNorm || null;

      // --- Normalizar MAC ---
      let { normalizado: macNorm } = normalizeField(equipo.macAddress, {
        uppercase: true,
      });
      if (!macNorm) {
        let tmpMac;
        let existe;
        do {
          tmpMac = generarMacProvisional();
          existe = await Equipo.findOne({
            _id: { $ne: equipo._id },
            macAddressNormalizado: tmpMac.toUpperCase(),
          });
        } while (existe); // bucle hasta que no colisione
        console.log(`⚠️  Asignando MAC temporal a ${equipo._id}: ${tmpMac}`);
        equipo.macAddress = tmpMac;
        macNorm = tmpMac.toUpperCase();
      }
      equipo.macAddressNormalizado = macNorm;

      // --- Validación de tipo ---
      const valoresPermitidos = ['laptop', 'pc', 'tablet', 'otro']; // ajusta a tu schema
      if (!valoresPermitidos.includes(equipo.tipo)) {
        console.log(
          `⚠️  Valor de tipo no válido en ${equipo._id}: "${equipo.tipo}", asignando "otro"`
        );
        equipo.tipo = 'otro';
      }

      await equipo.save();
      console.log(`✅ Equipo ${equipo._id} migrado con éxito`);
    } catch (error) {
      console.error(`❌ Error migrando equipo ${equipo._id}: ${error.message}`);
    }
  }

  await mongoose.disconnect();
  console.log('🔌 Migración finalizada y desconectado de MongoDB');
}

runMigration().catch((err) => {
  console.error('Error en la migración:', err);
  mongoose.disconnect();
});
