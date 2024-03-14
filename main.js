const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

// require('electron-reload')(__dirname);

let win;
let splash;
let tray;

function createSplashWindow() {
  splash = new BrowserWindow({
    width: 900,
    height: 700,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    icon: path.join(__dirname, 'assets/img/icon.png'),
    webPreferences: {
      nodeIntegration: true
    }
  });

  splash.loadFile(path.join(__dirname, 'pages/splash.html'));

  splash.once('ready-to-show', () => {
    splash.show();
    setTimeout(createMainWindow, 2000);
  });
}

function createMainWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    icon: path.join(__dirname, 'assets/img/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile(path.join(__dirname, 'pages/home.html'));

  win.once('ready-to-show', () => {
    win.show();
    splash.close();
  });

  win.on('closed', () => {
    win = null;
  });

  win.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      win.hide();
    }
  });

  autoUpdater.checkForUpdatesAndNotify();

}

function createTray() {
  tray = new Tray(path.join(__dirname, 'assets/img/icon.png'));

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Chimera', click: () => win.show() },
    { label: 'Exit Program', click: () => app.quit() }
  ]);

  tray.setToolTip('Chimera');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => win.show());
}

app.on('ready', () => {
  createSplashWindow();
  createTray();

  autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createSplashWindow();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

ipcMain.on('launch-exe-app', () => {
  var child = require('child_process').execFile;
  var executablePath = "C:\\WINDOWS\\system32\\notepad.exe";

  child(executablePath, function (err, data) {
    if (err) {
      console.error(err);
      return;
    }

    console.log(data.toString());
  });
});

autoUpdater.on('update-available', () => {
  autoUpdater.downloadUpdate();
});