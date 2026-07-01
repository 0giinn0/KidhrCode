const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { detectRuntimes } = require('./runtimeDetect');
const { runCode, debugCode } = require('./codeRunner');
const { launchEngine } = require('./engineLauncher');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#0a0a0a',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'desktop', 'index.html'));
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
    const extMap = { python: 'py', javascript: 'js', typescript: 'ts', rust: 'rs', go: 'go', java: 'java', cpp: 'cpp', csharp: 'cs', ruby: 'rb', php: 'php', bash: 'sh', dart: 'dart', gdscript: 'gd' };
    const ext = extMap[lang] || 'txt';
    const os = require('os');
    const p = require('path');
    const fs = require('fs');
    const filePath = p.join(os.tmpdir(), `khc_${Date.now()}.${ext}`);
    fs.writeFileSync(filePath, code);
    const { exec } = require('child_process');
    return new Promise((resolve) => {
      exec(`code "${filePath}"`, (err) => {
        resolve({ success: !err, error: err ? err.message : null, filePath });
      });
    });
  });

  ipcMain.handle('engine:launch', async (_, { engine, code, language }) => {
    try {
      return await launchEngine(engine, code, language);
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.on('window:minimize', () => mainWindow?.minimize());
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize();
    else mainWindow?.maximize();
  });
  ipcMain.on('window:close', () => mainWindow?.close());
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
