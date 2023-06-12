const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const { getUserSettings, setUserSettings } = require("../src/settings");
const { generateWallpaper, getSize } = require("../src/generateWallpaper");
const Store = require("electron-store");

const storage = new Store();

function compare(a, b) {
  if (a.width < b.width) {
    return -1;
  }
  if (a.width > b.width) {
    return 1;
  }
  return 0;
}

function chooseRandom(min, max) {
  return Math.floor(Math.random() * (parseInt(max) - min + 1) + min);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// promisified readdir in order to read all the directories in settings
const readdir = promisify(fs.readdir);

// For reseting the repeating callback once stop is pressed
let intervalId;
// For knowing how many displays there are in order to cycle which display changing wallpaper
let displayCount = 0;
// To keep a memory of the fileList of all the possible image paths to select, refreshes on settings change or start
let instanceFileList;

// Requests a generated collage wallpaper from another file and sets it as the wallpaper, reruns every timeInterval unless stopped
async function changeWallpaper() {
  const settings = getUserSettings();
  const { directories, isCollage, syncDisplays } = settings;
  const displays = screen.getAllDisplays().map((e) => e.size);
  let fileList = [];

  if (instanceFileList.length !== 0) {
    fileList = [...instanceFileList];
  } else {
    // Reads through the directories selected and brings a list of all the supported image files back
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
    // Shuffles the array for just a dash more RNG
    shuffleArray(fileList);
    instanceFileList = [...fileList];
  }

  // If collageNumber is 1 a single image that's landscape will be placed as the desktop wallpaper otherwise it determines the image setup
  let collageNumber = 1;
  if (isCollage) {
    collageNumber = chooseRandom(1, 6);
    if (collageNumber !== 1) {
      collageNumber = collageNumber * 2;
    }
  }

  // TO DO: if display rotation works to make it so they all change at the same time
  if (syncDisplays) {
    console.log("Number of displays", displays.length);
  }

  // Randomly select the images to be placed in the collage, at present doing twice the amount needed for more available picture sizes
  let collageImages = [];
  while (collageImages.length !== collageNumber) {
    const chosenImage = fileList[chooseRandom(0, fileList.length)];
    collageImages.push(chosenImage);
  }

  // If we aren't doing rotation this is here in order to pick the largest resolution display size and use those for collage
  const sortedDisplays = displays.sort(compare);
  const display = sortedDisplays[0];

  // TO DO: FOR IF WE GET THE DISPLAYS ROTATION WORKING
  // const display = displays[displayCount].size;

  let finalImage;
  // If the image picked for a single wallpaper isn't landscape grab another unitl it is
  if (collageNumber === 1) {
    finalImage = collageImages[0];
    let metadata = await getSize(collageImages[0]);
    while (metadata.orientation !== "horizontal" || metadata.width < 1500) {
      metadata = await getSize(fileList[chooseRandom(0, fileList.length)]);
    }
    finalImage = metadata.path;
  } else {
    finalImage = await generateWallpaper(display, collageImages);
  }

  // Sets the wallpaper
  import("wallpaper").then((wallpaper) => {
    wallpaper
      .setWallpaper(finalImage, { screen: displayCount })
      .then(() => {
        console.log("Success");
      })
      .catch((err) => {
        console.log("Error:", err);
      });
  });

  // Increment or reset targetDisplay for rotations
  if (displayCount === displays.length - 1) {
    displayCount = 0;
  } else {
    displayCount++;
  }
}

function createWindow() {
  // DEV just to check on the settings while doing changes
  const settings = getUserSettings();
  console.log("User Settings:", settings);

  const displays = screen.getAllDisplays().map((e) => e.size);
  let { width, height } = displays[0];

  if (settings.windowSize) {
    width = settings.windowSize.width;
    height = settings.windowSize.height;
  } else {
    width = Math.floor(width / 4);
    height = Math.floor(height / 4);
    storage.set("windowSize", { width, height });
  }

  // Create the browser window.
  const win = new BrowserWindow({
    width: width,
    height: height,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  //load the index.html from a url
  win.loadURL("http://localhost:3000");

  // Open the DevTools.
  win.webContents.openDevTools();

  win.on("resize", function () {
    let size = win.getSize();
    storage.set("windowSize", { width: size[0], height: size[1] });
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle("settings", getUserSettings);

  // Create the temp directory
  fs.mkdir(path.join(__dirname, "../", "temp"), { recursive: true }, (err) => {
    if (err) throw err;
  });

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
  instanceFileList = [];
  setUserSettings(formData);
});

ipcMain.on("settings:saved", function (event, message) {
  console.log(getUserSettings());
});

ipcMain.on("papetron:start", function (event) {
  instanceFileList = [];
  const settings = getUserSettings();
  const { timeInterval } = settings;
  changeWallpaper();
  intervalId = setInterval(changeWallpaper, timeInterval);
});

ipcMain.on("papetron:stop", function (event) {
  clearInterval(intervalId);
});

ipcMain.on("settings:open", function (event, value) {
  const displays = screen.getAllDisplays().map((e) => e.size);
  const maxHeight = displays[0].height;
  let { width, height } = storage.get("windowSize");
  let browserWindow = BrowserWindow.fromWebContents(event.sender);
  if (value === true) {
    height =
      Math.floor(maxHeight / 1.5) < height
        ? height
        : Math.floor(maxHeight / 1.5);
    browserWindow.setSize(width, height);
  } else {
    height = Math.floor(maxHeight / 4);
    browserWindow.setSize(width, height);
  }
  storage.set("windowSize", { width, height });
});
