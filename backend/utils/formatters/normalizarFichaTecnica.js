const cleanString = (str) =>
  str
    .replace(/[®™]/g, '') // elimina símbolos de marca
    .replace(/\s+/g, ' ') // normaliza espacios
    .trim();

/**
 * Normaliza campos técnicos de una ficha técnica.
 * @param {Object} data - Objeto parcial o completo de una ficha técnica.
 * @returns {Object} Objeto con los campos normalizados.
 */
function normalizarFichaTecnica(data) {
  const normalizado = { ...data };

  if (data.cpu) {
    normalizado.cpu = cleanString(data.cpu)
      .replace(/intel core/i, 'Intel Core')
      .replace(/amd ryzen/i, 'AMD Ryzen');
  }

  if (data.gpu) {
    normalizado.gpu = cleanString(data.gpu)
      .replace(/graphics/i, 'Graphics')
      .replace(/intel/i, 'Intel')
      .replace(/nvidia/i, 'NVIDIA')
      .replace(/radeon/i, 'Radeon');
  }

  if (data.ram) {
    normalizado.ram = cleanString(data.ram)
      .replace(/gb/i, 'GB')
      .replace(/ddr(\d)/i, 'DDR$1')
      .replace(/lpddr(\d)/i, 'LPDDR$1');
  }

  if (data.almacenamiento) {
    normalizado.almacenamiento = cleanString(data.almacenamiento)
      .replace(/gb/i, 'GB')
      .replace(/tb/i, 'TB')
      .replace(/ssd/i, 'SSD')
      .replace(/hdd/i, 'HDD')
      .replace(/nvme/i, 'NVMe')
      .replace(/sata/i, 'SATA');
  }

  return normalizado;
}

module.exports = normalizarFichaTecnica;
