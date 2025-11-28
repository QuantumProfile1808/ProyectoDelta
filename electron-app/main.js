const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { spawn, execSync } = require("child_process");
const fs = require("fs");

let djangoProcess;
let win;

function getPythonPath() {
  const embeddedPython = app.isPackaged
    ? path.join(process.resourcesPath, "app", "python-embed", "python.exe")
    : path.join(__dirname, "python-embed", "python.exe");

  console.log("Usando Python embebido:", embeddedPython);
  return embeddedPython;
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
    ? path.join(process.resourcesPath, "app", "frontend", "dist", "index.html")
    : path.join(__dirname, "..", "frontend", "dist", "index.html");

  console.log(`Cargando frontend desde: ${indexPath}`);
  win.loadFile(indexPath);
}

app.whenReady().then(() => {
  const backendPath = app.isPackaged
    ? path.join(process.resourcesPath, "app", "backend")
    : path.join(__dirname, "..", "backend");

  const pythonPath = getPythonPath();
  if (!fs.existsSync(pythonPath)) {
    dialog.showErrorBox("Error", "No se encontró Python embebido");
    return;
  }

  console.log(`Iniciando Django desde: ${backendPath}`);

  const backendExecutable = app.isPackaged
    ? path.join(
        process.resourcesPath,
        "app",
        "backend",
        "run_embedded_backend.bat"
      )
    : path.join(__dirname, "backend", "run_embedded_backend.bat");

  djangoProcess = spawn(backendExecutable, [], {
    cwd: path.dirname(backendExecutable),
    shell: true,
  });

  djangoProcess.stdout.on("data", (data) => console.log(`Django: ${data}`));
  djangoProcess.stderr.on("data", (data) =>
    console.error(`Django Error: ${data}`)
  );
  djangoProcess.on("error", (err) =>
    console.error(`Error al iniciar Django: ${err}`)
  );
  djangoProcess.on("close", (code) =>
    console.log(`Django terminó con código ${code}`)
  );

  createWindow();
});

app.on("window-all-closed", () => {
  try {
    console.log("Cerrando backend...");

    if (djangoProcess && djangoProcess.pid) {
      execSync(`taskkill /PID ${djangoProcess.pid} /T /F`);
    }

    execSync(`taskkill /IM python.exe /F`, { stdio: "ignore" });
  } catch (e) {
    console.error("Error al cerrar backend:", e);
  }

  if (process.platform !== "darwin") app.quit();
  app.quit();
});
