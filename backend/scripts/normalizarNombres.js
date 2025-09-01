require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');

(async () => {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);

    // ⚡ ir directo a la colección real, ignorando schema
    const collection = mongoose.connection.collection('clientes');

    console.log('📋 Buscando clientes con campo "nombre"...');
    const clientesAntiguos = await collection
      .find({ nombre: { $exists: true } })
      .toArray();

    console.log(`Encontrados ${clientesAntiguos.length} clientes para migrar`);

    for (const cliente of clientesAntiguos) {
      let nombres = '';
      let apellidos = '';

      if (cliente.nombre) {
        const partes = cliente.nombre.trim().split(/\s+/);
        if (partes.length > 1) {
          nombres = partes.shift();
          apellidos = partes.join(' ');
        } else {
          nombres = partes[0];
          apellidos = '';
        }
      }

      const email = cliente.email || `cliente.${cliente.dni}@sinemail.com`;

      console.log(
        `➡️ Migrando cliente ${cliente._id}: ${nombres} ${apellidos}`
      );

      await collection.updateOne(
        { _id: cliente._id },
        {
          $set: {
            nombres,
            apellidos,
            email,
            telefono: cliente.telefono || '',
            direccion: cliente.direccion || '',
            estado: cliente.estado || 'activo',
            calificacion: cliente.calificacion || 'regular',
            isActivo: cliente.isActivo ?? true,
            fechaRegistro: cliente.fechaRegistro || new Date(),
          },
          $unset: { nombre: '' }, // 🚀 eliminar campo viejo
        }
      );
    }

    console.log('✅ Migración completada con éxito');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error durante la migración:', err);
    process.exit(1);
  }
})();
