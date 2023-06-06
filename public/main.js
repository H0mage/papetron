const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const { getUserSettings, setUserSettings } = require("../src/settings");
const { generateWallpaper } = require("../src/generateWallpaper");

const readdir = promisify(fs.readdir);

let intervalId;

function chooseRandom(min, max) {
  return Math.floor(Math.random() * (parseInt(max) - min + 1) + min);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function changeWallpaper() {
  const settings = getUserSettings();
  const { directories, isCollage, syncDisplays } = settings;
  const displays = screen.getAllDisplays();
  let fileList = [];
  for (let i = 0; i < directories.length; i++) {
    let res = await readdir(directories[i]);
    const fileExtensions = ["png", "jpg", "jpeg"];
    let filtered = res.filter((file) => {
      if (fileExtensions.includes(file.split(".").pop())) {
        return file;
      }
      return "";
    });
    filtered = filtered.map((element) => {
      return `${directories[i]}\\${element}`;
    });
    fileList = [...fileList, ...filtered];
  }
  shuffleArray(fileList);

  let collageNumber = 1;
  if (isCollage) {
    collageNumber = chooseRandom(1, 6);
  }
  if (syncDisplays) {
    console.log(displays.length);
  }

  let collageImages = [];
  while (collageImages.length !== collageNumber) {
    const chosenImage = fileList[chooseRandom(0, fileList.length)];
    collageImages.push(chosenImage);
  }

  const display = screen.getAllDisplays()[0].size;
  let finalImage;
  if (collageNumber === 1) {
    finalImage = collageImages[0];
  } else {
    finalImage = await generateWallpaper(display, collageImages);
  }

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
}

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
  const settings = getUserSettings();
  const { timeInterval } = settings;
  changeWallpaper();
  intervalId = setInterval(changeWallpaper, timeInterval);
});

ipcMain.on("papetron:stop", function (event) {
  console.log("stoppo");
  clearInterval(intervalId);
});
