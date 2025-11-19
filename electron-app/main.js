const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn, execSync } = require('child_process');
const fs = require('fs');

let djangoProcess;
let win;

function getPythonPath() {
  try {
    const pythonPath = execSync('where python', { encoding: 'utf-8' })
      .split('\n')[0]
      .trim();
    console.log(`✅ Python detectado en: ${pythonPath}`);
    return pythonPath;
  } catch (e) {
    console.error('❌ No se encontró Python en PATH');
    return null;
  }
}

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const indexPath = app.isPackaged
    ? path.join(process.resourcesPath, 'frontend', 'dist', 'index.html')
    : path.join(__dirname, '..', 'frontend', 'dist', 'index.html');

  console.log(`📂 Cargando frontend desde: ${indexPath}`);
  win.loadFile(indexPath);
}

app.whenReady().then(() => {
  const backendPath = app.isPackaged
    ? path.join(process.resourcesPath, 'backend')
    : path.join(__dirname, '..', 'backend');

  const pythonPath = getPythonPath();
  if (!pythonPath || !fs.existsSync(pythonPath)) {
    dialog.showErrorBox('Error', 'No se encontró Python en el sistema. Asegúrate de tenerlo en PATH.');
    return;
  }

  console.log(`🚀 Iniciando Django desde: ${backendPath}`);

  // 🔹 Importante: igual que tu comando manual
  djangoProcess = spawn(pythonPath, ['manage.py', 'runserver', '127.0.0.1:8000'], {
    cwd: backendPath,
    shell: true,
    detached: false,
  });

  djangoProcess.stdout.on('data', (data) => console.log(`Django: ${data}`));
  djangoProcess.stderr.on('data', (data) => console.error(`Django Error: ${data}`));
  djangoProcess.on('error', (err) => console.error(`❌ Error al iniciar Django: ${err}`));
  djangoProcess.on('close', (code) => console.log(`⚠️ Django terminó con código ${code}`));

  createWindow();
});

app.on('window-all-closed', () => {
  if (djangoProcess) djangoProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});
