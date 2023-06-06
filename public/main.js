const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");
const fs = require("fs");
const { getUserSettings, setUserSettings } = require("../src/settings");
const { generateWallpaper } = require("../src/generateWallpaper");

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

function chooseRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

ipcMain.on("papetron:start", function (event) {
  const settings = getUserSettings();
  const { directories, timeInterval, isCollage, syncDisplays } = settings;
  const displays = screen.getAllDisplays();
  fs.readdir(directories[0], async (err, files) => {
    let collageNumber = 1;

    if (isCollage) {
      collageNumber = chooseRandom(1, 6);
    }
    if (syncDisplays) {
      console.log(displays.length);
    }

    let collageImages = [];
    while (collageImages.length !== collageNumber) {
      const chosenImage = chooseRandom(0, files.length);
      const splitPath = directories[0].split("\\");
      splitPath.push(files[chosenImage]);
      const imagePath = splitPath.join("\\");
      collageImages.push(imagePath);
    }

    const display = screen.getAllDisplays()[0].size;
    let finalImage;
    if (collageNumber === 1) {
      finalImage = collageImages[0];
    } else {
      finalImage = await generateWallpaper(display, collageImages);
    }
    console.log(finalImage);

    import("wallpaper").then((wallpaper) => {
      wallpaper
        .setWallpaper(finalImage)
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
