const axios = require('axios');

const obtenerCodigosTelefonicos = async () => {
  try {
    const url = 'https://restcountries.com/v3.1/all?fields=name,idd,flags';
    const { data } = await axios.get(url);

    const codigos = data
      .map((pais) => {
        const nombre = pais.name?.common;
        const root = pais.idd?.root;
        const suffix = pais.idd?.suffixes?.[0] || '';
        const codigo = root ? root + suffix : null;
        const bandera = pais.flags?.svg;

        return {
          pais: nombre,
          codigo,
          bandera,
        };
      })
      .filter((p) => p.codigo && p.pais); // Filtramos nulos o incompletos

    return codigos;
  } catch (error) {
    console.error('❌ Error al obtener códigos telefónicos:', error.message);
    return [];
  }
};

module.exports = obtenerCodigosTelefonicos;
