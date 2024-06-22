const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path')
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg')

const isDev = process.env.NODE_ENV === 'development';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  console.log("------------------------- DIRNAME", __dirname)

  if (isDev) {
    mainWindow.loadURL('http://localhost:9000');
  } else {

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  }


  // Manejar el evento de seleccionar carpeta
  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    if (result.canceled) {
      return null;
    } else {
      return result.filePaths[0];
    }
  });



  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.handle('save-file', async (event, { filePath, fileContent }) => {

  // Convert ArrayBuffer to Buffer
  const buffer = Buffer.from(fileContent);

  const basePath = path.join(__dirname, '/public/files');
  const savePath = path.join(basePath, filePath);

  console.log("FilePath", filePath)
  console.log("savePath", savePath)

  fs.writeFileSync(savePath, buffer);
  return {
    isSuccess: true,
    basePath,
    path: savePath,
  };
});

ipcMain.handle('crop-audio', async (event, { basePath, inputFile, fileExtension, startTime, duration }) => {
  const temp_file = `${basePath}/tmp_output.${fileExtension}`

  const filename = inputFile.split('/').pop()
    
  console.log("Temporal file", temp_file)
  console.log("Input file", inputFile)

  return new Promise((resolve, reject) => {

    const finalOutputPath = path.join(basePath, filename);

    // Copiar el archivo desde .asar a un directorio temporal fuera de .asar
    const inputFilePath = path.join(app.getAppPath(), 'public', 'files', filename);
    console.log("inputFilePath file", inputFilePath)
    console.log("---------------------------------------------")

    fs.copyFileSync(inputFilePath, finalOutputPath);

    ffmpeg(finalOutputPath)
      .setStartTime(startTime) // tiempo de inicio en segundos
      .setDuration(duration)   // duración del corte en segundos
      .output(temp_file)
      .on('end', function () {
        console.log('Corte de audio completado!');

        fs.renameSync(temp_file, finalOutputPath);

        resolve()
      })
      .on('error', function (err) {
        console.error('Error al cortar el audio:', err);
        reject()
      }).run();
  })

});

