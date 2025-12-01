export const LogBuffer = {
  logs: [],
  push(entry) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      ...entry,
    });
  },
  clear() {
    this.logs = [];
  },
  get() {
    return [...this.logs];
  },
  download(filename = 'logs.json') {
    const blob = new Blob([JSON.stringify(this.logs, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  },
};
