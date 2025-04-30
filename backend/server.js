const mongoose = require('mongoose');
const app = require('./app');

// Conectar a la DB
const uri = process.env.NODE_ENV === 'test' ? process.env.MONGODB_URI_TEST : process.env.MONGODB_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Conectado a MongoDB');
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}).catch((err) => {
  console.error('Error al conectar a la DB:', err);
});
