const { app, BrowserWindow } = require('electron');
const path = require('path');
require('electron-reload')(__dirname);

let win;
let splash;

function createSplashWindow() {
  splash = new BrowserWindow({
    width: 900,
    height: 700,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
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
    webPreferences: {
      nodeIntegration: true
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
}

app.on('ready', createSplashWindow);

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
