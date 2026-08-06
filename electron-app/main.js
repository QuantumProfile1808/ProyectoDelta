const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { spawn, execSync } = require("child_process");
const fs = require("fs");

let djangoProcess;
let win;

function getPythonPath() {
  const embeddedPython = path.join(__dirname, "python-embed", "python.exe");

  console.log("Usando Python embebido:", embeddedPython);
  return embeddedPython;
}

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    icon: path.join(__dirname, "build", "icon.ico"),
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
    ? path.join(process.resourcesPath, "app", "backend-dist")
    : path.join(__dirname, "..", "backend");

  console.log(`Iniciando Django desde: ${backendPath}`);

  const command = app.isPackaged
    ? path.join(backendPath, "manage.exe")
    : getPythonPath();

  const args = app.isPackaged
    ? ["runserver", "127.0.0.1:8000"]
    : ["manage.py", "runserver", "127.0.0.1:8000"];

  if (!fs.existsSync(command)) {
    dialog.showErrorBox("Error", `No se encontro el backend: ${command}`);
    return;
  }

  djangoProcess = spawn(command, args, {
    cwd: backendPath,
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
    console.log(`Django termino con codigo ${code}`)
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
