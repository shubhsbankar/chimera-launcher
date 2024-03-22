const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const DiscordRPC = require('discord-rpc');
const clientId = '1217774050084917328';
DiscordRPC.register(clientId);
require('electron-reload')(__dirname);

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
    width: 1000,
    height: 850,
    frame: false,
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

  const appRootPath = app.getAppPath();
  const executablePath = path.join(appRootPath, 'app', 'dofus.exe');
  
  var child = require('child_process').execFile;

  child(executablePath, function (err, data) {
    if (err) {
      console.error(err);
      return;
    }

    console.log(data.toString());
  });
});

ipcMain.on('close-main-window', (event) => {
  if (!app.isQuitting) {
    event.preventDefault();
    win.hide();
  }
});

autoUpdater.on('update-available', () => {
  autoUpdater.downloadUpdate();
});


const rpc = new DiscordRPC.Client({ transport: 'ipc' });
const startTimestamp = new Date();

async function setActivity() {
  if (!rpc || !win) {
    return;
  }

  rpc.setActivity({
    details: `You can write some details here!`,
    state: 'Enjoying my gaming time!',
    startTimestamp,
    largeImageKey: 'logo',
    largeImageText: 'some radnom text',
    smallImageKey: 'logo',
    smallImageText: 'some radnom text',
    instance: false,
    buttons: [
      {
        "label": "Visit Website",
        "url": "http://chimeraf2w.com/"
      },
      {
        "label": "Test button",
        "url": "https://multiverzum.com/"
      }
    ]
  });
}

rpc.on('ready', async () => {
  setActivity();
  setInterval(() => {
    setActivity();
  }, 15 * 1000);
});

rpc.login({ clientId }).catch(console.error);