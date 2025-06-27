const fs = require('fs');
const path = require('path');

const LOG_DIR = path.resolve(__dirname, '__tests__', 'report');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

let currentTestFile = null;
let currentTestName = null;
let logStream = null;

function initLogger(testFilePath) {
  if (!testFilePath) return;
  const fileName = path.basename(testFilePath).replace(/\.[jt]sx?$/, '');
  currentTestFile = fileName;

  const logPath = path.join(LOG_DIR, `${fileName}.log`);
  logStream = fs.createWriteStream(logPath, { flags: 'w' });
}

function setCurrentTest(testName) {
  currentTestName = testName;
  log(`\n🧪 Test: ${testName}\n`);
}

function log(message) {
  const timestamp = new Date().toISOString();
  const formatted = `[${timestamp}] ${
    currentTestName ? `[${currentTestName}] ` : ''
  }${message}\n`;

  if (logStream) logStream.write(formatted);
  console.log(formatted.trim());
}

function closeLogger() {
  if (logStream) {
    logStream.end();
    logStream = null;
  }
  currentTestFile = null;
  currentTestName = null;
}

module.exports = {
  initLogger,
  setCurrentTest,
  log,
  closeLogger,
};
