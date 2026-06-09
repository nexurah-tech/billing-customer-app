const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App version
  getVersion: () => ipcRenderer.invoke('get-version'),
  // Platform info
  platform: process.platform,
})
