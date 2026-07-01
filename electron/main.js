const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { detectRuntimes } = require('./runtimeDetect');
const { runCode, debugCode } = require('./codeRunner');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0a0a0a',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:8081');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

function registerIpcHandlers() {
  ipcMain.handle('runtime:detect', async () => {
    return await detectRuntimes();
  });

  ipcMain.handle('code:run', async (_, { lang, code, stdin }) => {
    return await runCode(lang, code, stdin);
  });

  ipcMain.on('code:debug', (event, { lang, code, stdin }) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    debugCode(lang, code, stdin,
      (data) => { win.webContents.send('code:debug-output', data); },
      (data) => { win.webContents.send('code:debug-done', data); }
    );
  });

  ipcMain.handle('app:version', () => app.getVersion());

  ipcMain.handle('vscode:open', async (_, { code, lang }) => {
    const extMap = { python: 'py', javascript: 'js', typescript: 'ts', rust: 'rs', go: 'go', java: 'java', cpp: 'cpp', csharp: 'cs', ruby: 'rb', php: 'php', bash: 'sh', dart: 'dart' };
    const ext = extMap[lang] || 'txt';
    const os = require('os');
    const path = require('path');
    const fs = require('fs');
    const filePath = path.join(os.tmpdir(), `khc_${Date.now()}.${ext}`);
    fs.writeFileSync(filePath, code);
    const { exec } = require('child_process');
    return new Promise((resolve) => {
      exec(`code "${filePath}"`, (err) => {
        resolve({ success: !err, error: err ? err.message : null, filePath });
      });
    });
  });
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
