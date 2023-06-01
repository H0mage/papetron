const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { getUserSettings, setUserSettings } = require("../src/settings");

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const settings = getUserSettings();
  console.log(settings);

  //load the index.html from a url
  win.loadURL("http://localhost:3000");

  // Open the DevTools.
  win.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle("settings", getUserSettings);
  createWindow();
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on("save:settings", function (event, formData) {
  console.log("newData from submit", formData);
  setUserSettings(formData);
});

ipcMain.on("settings:saved", function (event, message) {
  console.log(getUserSettings());
});

ipcMain.on("papetron:start", function (event) {
  console.log("starto");
  const settings = getUserSettings();
  const directories = settings.directories;
  console.log(directories);
  fs.readdir(directories[0], (err, files) => {
    const chosenImage = files[Math.floor(Math.random() * files.length)];
    const splitPath = directories[0].split("\\");
    splitPath.push(chosenImage);
    const imagePath = splitPath.join("\\");
    console.log(imagePath);
    // setWallpaper(imagePath);
    import("wallpaper").then((wallpaper) => {
      wallpaper
        .setWallpaper(imagePath)
        .then(() => {
          console.log("Success");
        })
        .catch((err) => {
          console.log("Error:", err);
        });
    });
  });
});

ipcMain.on("papetron:stop", function (event) {
  console.log("stoppo");
});
