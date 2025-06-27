// generarReporte.js (versión corregida con logs y fileName procesado)
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const resultadosPath = path.resolve(
  __dirname,
  '__tests__/report/resultados.json'
);
const plantillaPath = path.resolve(__dirname, '__tests__/report/plantilla.ejs');
const outputHTML = path.resolve(__dirname, '__tests__/report/resumen.html');

(async () => {
  try {
    const resultadosRaw = fs.readFileSync(resultadosPath, 'utf-8');
    const resultados = JSON.parse(resultadosRaw);

    const logs = {};
    const reportDir = path.resolve(__dirname, '__tests__/report');

    // Preprocesar fileName dentro de cada resultado
    for (const file of resultados.testResults) {
      file.fileName = path.basename(file.name).replace(/\.[jt]sx?$/, '');
      const logPath = path.join(reportDir, `${file.fileName}.log`);
      logs[file.fileName] = fs.existsSync(logPath)
        ? fs.readFileSync(logPath, 'utf-8')
        : 'No log disponible.';
    }

    const html = await ejs.renderFile(plantillaPath, {
      resultados,
      summary: resultados,
      logs,
    });

    fs.writeFileSync(outputHTML, html);
    console.log('✅ Reporte HTML generado en resumen.html');
  } catch (error) {
    console.error('❌ Error al generar el reporte:', error);
  }
})();
