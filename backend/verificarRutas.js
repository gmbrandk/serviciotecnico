// verificarRutas.js
require('module-alias/register');
const path = require('path');

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
    console.error(`❌ ${alias} → Error: ${err.message}`);
  }
}
