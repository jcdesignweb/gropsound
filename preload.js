// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded'); // Añade esta línea para verificar

contextBridge.exposeInMainWorld('electron', {
  cropAudio: (basePath, inputFile, fileExtension, startTime, duration, outputFile) => ipcRenderer.invoke('crop-audio', { basePath, inputFile, fileExtension, startTime, duration, outputFile }),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectFile: () => ipcRenderer.invoke('select-file'),

  
});