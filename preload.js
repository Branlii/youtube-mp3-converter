// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    downloadUrls: (urls, outputFolder) => ipcRenderer.invoke('download-urls', urls, outputFolder),
    selectFolder: () => ipcRenderer.invoke('select-folder'),
  }
);
