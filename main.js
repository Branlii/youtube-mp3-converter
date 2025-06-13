const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');

const execFileAsync = promisify(execFile);

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the index.html of the app
  mainWindow.loadFile('index.html');

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();
}

// When Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Process the list of URLs
async function processUrls(urls) {
  const results = [];
  
  for (const url of urls) {
    if (url.trim()) {
      const outputFolder = 'output/';
      try {
        const { stdout } = await execFileAsync('./scripts/YoutubeCliDownloader', [url, outputFolder]);
        results.push({ url, success: true, message: `Downloaded ${url} to ${outputFolder}` });
        console.log(`Downloaded ${url} to ${outputFolder}`);
        console.log(stdout);
      } catch (error) {
        results.push({ url, success: false, message: error.message });
        console.error(`Error processing ${url}:`, error);
      }
    }
  }
  
  return results;
}

// Handle IPC communication from the renderer process
ipcMain.handle('download-urls', async (event, urls) => {
  return await processUrls(urls);
});