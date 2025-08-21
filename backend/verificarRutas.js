// verificarRutas.js
require('module-alias/register');
const path = require('path');
const fs = require('fs');

console.log('🔍 Verificando resolución de alias:\n');

// Cargar _moduleAliases desde package.json
const pkg = require('./package.json');
const aliases = pkg._moduleAliases || {};

for (const [alias, target] of Object.entries(aliases)) {
  try {
    const resolved = require.resolve(alias); // 👈 solo resuelve, no ejecuta
    const absoluteTarget = path.resolve(__dirname, target);

    console.log(
      `\x1b[32m✔ ${alias}\x1b[0m → ${resolved}\n   ↳ esperado: ${absoluteTarget}`
    );

    if (!resolved.startsWith(absoluteTarget)) {
      console.warn(
        `\x1b[33m⚠ Advertencia:\x1b[0m ${alias} no apunta exactamente a ${absoluteTarget}`
      );
    }
  } catch (err) {
    console.error(`\x1b[31m✖ ${alias}\x1b[0m → Error: ${err.message}`);
  }
}

// Extra: buscar en el código imports relativos de /models (posibles duplicados)
console.log('\n🔎 Buscando imports relativos problemáticos (../models/...):\n');

function scanDir(dir) {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules')) scanDir(fullPath);
    } else if (file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes("require('../models")) {
        console.log(`⚠ Encontrado require relativo en: ${fullPath}`);
      }
      if (
        content.includes('@models/') &&
        content.match(/@models\/.+\.js['"]/)
      ) {
        console.log(
          `⚠ Encontrado import con extensión explícita en: ${fullPath}`
        );
      }
    }
  }
}

scanDir(path.join(__dirname));
