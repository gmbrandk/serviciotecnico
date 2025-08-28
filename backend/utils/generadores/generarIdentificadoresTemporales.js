// 📁 utils/generadores/generarIdentificadoresTemporales.js

function generarSkuTemporal() {
  return `TMP-SKU-${Date.now()}`;
}

function generarNroSerieTemporal() {
  return `TMP-SN-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
}

function generarMacProvisional() {
  const fecha = new Date();
  const yy = fecha.getFullYear().toString().slice(-2);
  const mm = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dd = fecha.getDate().toString().padStart(2, '0');
  const rand = Math.floor(Math.random() * 99)
    .toString()
    .padStart(2, '0');

  // 🚩 Prefijo FA:KE para evitar choques con MAC reales
  return `FA:KE:${yy}:${mm}:${dd}:${rand}`;
}

module.exports = {
  generarSkuTemporal,
  generarNroSerieTemporal,
  generarMacProvisional,
};
