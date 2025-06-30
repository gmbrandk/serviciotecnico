// scripts/generarCodigosTelefonicos.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const URL = 'https://restcountries.com/v3.1/all?fields=name,idd,flags,cca2';

(async () => {
  try {
    const { data } = await axios.get(URL);

    const codigos = data
      .filter((pais) => pais.idd?.root && pais.idd?.suffixes?.length)
      .flatMap((pais) =>
        pais.idd.suffixes.map((sufijo) => ({
          pais: pais.name.common,
          iso: pais.cca2,
          codigo: `${pais.idd.root}${sufijo}`,
          bandera: pais.flags.svg || '',
        }))
      )
      .sort((a, b) => a.pais.localeCompare(b.pais));

    const outputPath = path.resolve(
      __dirname,
      '../utils/telefonia/codigosTelefonicos.json'
    );
    fs.writeFileSync(outputPath, JSON.stringify(codigos, null, 2));
    console.log(`✅ Códigos guardados en: ${outputPath}`);
  } catch (err) {
    console.error('❌ Error al generar códigos telefónicos:', err.message);
  }
})();
