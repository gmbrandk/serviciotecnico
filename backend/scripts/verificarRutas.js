// scripts/verificarRutas.js
const path = require('path');

// 👇 Establece el path base manualmente
require('module-alias').addAliases({
  '@controllers': path.join(__dirname, '..', 'controllers'),
  '@middlewares': path.join(__dirname, '..', 'middlewares'),
  '@routes': path.join(__dirname, '..', 'routes'),
  '@models': path.join(__dirname, '..', 'models'),
  '@utils': path.join(__dirname, '..', 'utils'),
  '@services': path.join(__dirname, '..', 'services'),
  '@helpers': path.join(__dirname, '..', 'helpers'),
  app: path.join(__dirname, '..', 'app.js'),
});

console.log('🔍 Resolviendo rutas de alias:\n');

const aliases = {
  '@controllers': '@controllers',
  '@middlewares': '@middlewares',
  '@routes': '@routes',
  '@models': '@models',
  '@utils': '@utils',
  '@services': '@services',
  '@helpers': '@helpers',
  app: 'app',
};

for (const [alias, aliasPath] of Object.entries(aliases)) {
  try {
    const resolved = require.resolve(aliasPath);
    console.log(`${alias} → ✅ ${resolved}`);
  } catch (err) {
    console.error(`❌ Error al resolver ${alias}: ${err.message}`);
  }
}
