const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");
const fs = require("fs");
// const jimp = require("jimp");
const sharp = require("sharp");
const { getUserSettings, setUserSettings } = require("../src/settings");

async function getMetaData(path) {
  try {
    const metadata = await sharp(path).metadata();
    console.log(metadata);
  } catch (error) {
    console.log(`An error occurred during processing: ${error}`);
  }
}

async function compositeImages(display, imagePaths) {
  console.log(imagePaths);
  const collageNumber = imagePaths.length;

  if (collageNumber === 2) {
    const img_1_width = Math.floor((display.width / 10) * 6);
    const img_2_width = display.width - img_1_width;
    try {
      const image1 = await sharp(imagePaths[0])
        .resize({
          width: img_1_width,
          height: display.height,
        })
        .toBuffer();
      const image2 = await sharp(imagePaths[1])
        .resize({
          width: img_2_width,
          height: display.height,
        })
        .toBuffer();
      console.log(image1, image2, "COMPOSITING");

      await sharp({
        create: {
          width: display.width,
          height: display.height,
          channels: 3,
          background: "#000000",
        },
      })
        .composite([
          { input: image1, top: 0, left: 0 },
          { input: image2, top: 0, left: img_1_width },
        ])
        .toFile("test.png");
    } catch (error) {
      console.log(error);
    }
  }
  // } else if (collageNumber === 3) {
  //   const section_1_width = Math.floor((display.width / 10) * 6);
  //   const section_2_width = display.width - section_1_width;
  // }
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

function chooseRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

ipcMain.on("papetron:start", function (event) {
  console.log("starto");
  const settings = getUserSettings();
  const { directories, timeInterval, isCollage, syncDisplays } = settings;
  const displays = screen.getAllDisplays();
  console.log(displays);
  console.log(directories);
  fs.readdir(directories[0], async (err, files) => {
    let collageNumber = 2; //CHANGE THIS TO 1 AFTER DONE

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
    console.log(collageImages, collageImages.length, collageNumber);

    // setWallpaper(imagePath);
    const display = screen.getAllDisplays()[0].size;
    // const jimps = [];
    const images = [];
    let finalImage = collageImages[0];
    for (var i = 0; i < collageImages.length; i++) {
      // jimps.push(jimp.read(collageImages[i]));
      const imageMetadata = getMetaData(collageImages[i]);
      images.push(imageMetadata);
    }

    compositeImages(display, collageImages);

    if (collageNumber === 2) {
      const image1 = sharp(collageImages[0]);
      const image2 = sharp(collageImages[1]);

      const width = Math.floor((display.width / 10) * 6);
      await image1.resize(width, display.height);
      await image2.resize(display.width - width, display.height);

      Promise.all(images)
        .then(function (data) {
          return Promise.all(images);
        })
        .then(function (data) {
          console.log(display);
          finalImage = data[0];
        });
    }
    import("wallpaper").then((wallpaper) => {
      wallpaper
        .setWallpaper(collageImages[0])
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