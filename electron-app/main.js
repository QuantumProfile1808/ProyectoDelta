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
    // ⬇⬇⬇ CAMBIO 1 (agregamos "app")
    ? path.join(process.resourcesPath, 'app', 'frontend', 'dist', 'index.html')
    : path.join(__dirname, '..', 'frontend', 'dist', 'index.html');

  console.log(`📂 Cargando frontend desde: ${indexPath}`);
  win.loadFile(indexPath);
}

app.whenReady().then(() => {
  const backendPath = app.isPackaged
    ? path.join(process.resourcesPath, 'app', 'backend')
    : path.join(__dirname, '..', 'backend');

  const pythonPath = getPythonPath();
  if (!pythonPath || !fs.existsSync(pythonPath)) {
    dialog.showErrorBox('Error', 'No se encontró Python en el sistema. Asegúrate de tenerlo en PATH.');
    return;
  }

  console.log(`🚀 Iniciando Django desde: ${backendPath}`);

  const backendExecutable = app.isPackaged
    ? path.join(process.resourcesPath, 'app', 'backend', 'run_embedded_backend.bat')
    : path.join(__dirname, '..', 'backend', 'run_embedded_backend.bat');

  djangoProcess = spawn(backendExecutable, [], {
    cwd: path.dirname(backendExecutable),
    shell: true
  });

  djangoProcess.stdout.on('data', (data) => console.log(`Django: ${data}`));
  djangoProcess.stderr.on('data', (data) => console.error(`Django Error: ${data}`));
  djangoProcess.on('error', (err) => console.error(`❌ Error al iniciar Django: ${err}`));
  djangoProcess.on('close', (code) => console.log(`⚠️ Django terminó con código ${code}`));

  createWindow();
});

// TODO: El proceso no se cierra, queda en segundo plano y se abre la cantyidad de veces que quieras.
app.on("window-all-closed", () => {
  if (djangoProcess) {
    try {
      const pid = djangoProcess.pid;
      require("child_process").exec(`taskkill /PID ${pid} /T /F`);
    } catch (e) {
      console.error("Error al cerrar backend:", e);
    }
  }

  if (process.platform !== "darwin") app.quit();
  app.quit();
});