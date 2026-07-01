const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  detectRuntimes: () => ipcRenderer.invoke('runtime:detect'),
  runCode: (lang, code, stdin) => ipcRenderer.invoke('code:run', { lang, code, stdin }),
  debugCode: (lang, code, stdin) => {
    ipcRenderer.send('code:debug', { lang, code, stdin });
  },
  onDebugOutput: (callback) => {
    ipcRenderer.on('code:debug-output', (_event, data) => callback(data));
  },
  onDebugDone: (callback) => {
    ipcRenderer.on('code:debug-done', (_event, data) => callback(data));
  },
  removeDebugListeners: () => {
    ipcRenderer.removeAllListeners('code:debug-output');
    ipcRenderer.removeAllListeners('code:debug-done');
  },
  getAppVersion: () => ipcRenderer.invoke('app:version'),
});
