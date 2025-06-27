const fs = require('fs');
const path = require('path');

// Directorio donde se guardarán los logs individuales
const LOG_DIR = path.resolve(__dirname, '__tests__', 'report');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

let currentTestFile = null;
let logStream = null;

function initLogger(testFilePath) {
  if (!testFilePath) return;

  const fileName = path.basename(testFilePath).replace(/\.[jt]sx?$/, '');
  currentTestFile = fileName;
  const logPath = path.join(LOG_DIR, `${fileName}.log`);
  logStream = fs.createWriteStream(logPath, { flags: 'w' });
}

function log(message) {
  const timestamp = new Date().toISOString();
  const formatted = `[${timestamp}] ${message}\n`;

  if (logStream) logStream.write(formatted);
  console.log(formatted.trim());
}

function closeLogger() {
  if (logStream) {
    logStream.end();
    logStream = null;
    currentTestFile = null;
  }
}

module.exports = {
  initLogger,
  log,
  closeLogger,
};
