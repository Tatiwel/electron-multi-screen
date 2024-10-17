const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');

let mainWindow;
let newWin;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'src/main/preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('src/renderer/pages/index.html');

  mainWindow.on('closed', () => {
    if (newWin) {
      newWin.close();
    }
  });
}

function openNewWindow(userInput) {
  newWin = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'src/main/preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  newWin.loadFile('src/renderer/pages/newWindow.html').then(() => {
    newWin.webContents.send('display-user-name', userInput);
  });

  newWin.on('closed', () => {
    newWin = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('open-new-window', (event, userInput) => {
  openNewWindow(userInput);
});

ipcMain.on('update-value', (event, updatedInput) => {
  if (newWin) {
    newWin.webContents.send('update-value', updatedInput);
  }
});
