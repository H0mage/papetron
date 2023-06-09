const { app, BrowserWindow, ipcMain, screen, Tray, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const Store = require("electron-store");
const isDev = require("electron-is-dev");

const { getUserSettings, setUserSettings } = require(`${
  isDev ? "../electron/settings" : "./electron/settings"
}`);
const { generateWallpaper, getSize } = require(`${
  isDev ? "../electron/generateWallpaper" : "./electron/generateWallpaper"
}`);
const log = require("electron-log");
const wallpaper = require("wallpaper");

const storage = new Store();

let win = null;

let tray = null;

// promisified readdir in order to read all the directories in settings
const readdir = promisify(fs.readdir);

// For reseting the repeating callback once stop is pressed
let intervalId;
// For knowing how many displays there are in order to cycle which display changing wallpaper
let displayCount = 0;
// To keep a memory of the fileList of all the possible image paths to select, refreshes on settings change or start
let instanceFileList = [];

async function papetronStart() {
  const isRunning = storage.get("isRunning");
  if (isRunning) {
    return null;
  }
  if (intervalId) {
    clearInterval(intervalId);
  }
  const settings = getUserSettings();
  const { timeInterval } = settings;
  storage.set("isRunning", true);
  changeWallpaper();
  intervalId = setInterval(changeWallpaper, timeInterval);
}

async function papetronStop() {
  const isRunning = storage.get("isRunning");
  if (!isRunning) {
    return null;
  }
  instanceFileList = [];
  storage.set("isRunning", false);
  clearInterval(intervalId);
}

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
// For extra variance, not really needed
// function shuffleArray(array) {
//   for (let i = array.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [array[i], array[j]] = [array[j], array[i]];
//   }
// }

// Requests a generated collage wallpaper from another file and sets it as the wallpaper, reruns every timeInterval unless stopped
async function changeWallpaper() {
  const settings = getUserSettings();
  const { directories, isCollage, maxCollage } = settings;
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
    // shuffleArray(fileList);
    instanceFileList = [...fileList];
  }

  // If collageNumber is 1 a single image that's landscape will be placed as the desktop wallpaper otherwise it determines the image setup
  let collageNumber = 1;
  if (isCollage) {
    collageNumber = chooseRandom(1, maxCollage);
    if (collageNumber !== 1) {
      collageNumber = collageNumber * 2;
    }
  }

  // TO DO: if display rotation works to make it so they all change at the same time
  // if (syncDisplays) {
  //   console.log("Number of displays", displays.length);
  // }

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
    finalImage = await generateWallpaper(
      display,
      collageImages,
      path.join(app.getPath("temp"), "/papetron/tempWallpaper.png")
    );
  }

  // Sets the wallpaper
  try {
    await wallpaper.set(finalImage, { screen: displayCount });
  } catch (err) {
    console.log(err);
    log.info(err);
  }

  // Increment or reset targetDisplay for rotations
  if (displayCount === displays.length - 1) {
    displayCount = 0;
  } else {
    displayCount++;
  }
}

function createWindow() {
  if (BrowserWindow.getAllWindows().length === 0) {
    const settings = getUserSettings();

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

    let preloadPath = path.join(
      __dirname,
      isDev ? "../electron/preload.js" : "./electron/preload.js"
    );

    // Create the browser window.
    win = new BrowserWindow({
      width: width,
      height: height,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
        backgroundThrottling: false,
        preload: preloadPath,
      },
    });

    //load the index.html from a url
    win.loadURL(
      isDev
        ? "http://localhost:3000"
        : `file://${path.join(__dirname, "./index.html")}`
    );

    // Open the DevTools.
    if (isDev) {
      win.webContents.openDevTools();
    }

    win.on("resize", function () {
      let size = win.getSize();
      storage.set("windowSize", { width: size[0], height: size[1] });
    });

    // win.on("minimize", function (event) {
    //   event.preventDefault();
    //   win.hide();
    //   win = null;
    // });

    win.on("close", function (event) {
      const settings = getUserSettings();
      if (settings.keepRunning && !app.isQuiting) {
        event.preventDefault();
        win.destroy();
        win = null;
      } else {
        app.quit();
      }
    });
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle("settings", getUserSettings);

  if (isDev) {
    // Create the temp directory
    fs.mkdir(path.join(__dirname, "../temp"), { recursive: true }, (err) => {
      if (err) throw err;
    });
    tray = new Tray(path.join(__dirname, "../public/icon.png"));
  } else {
    const newPath = app.getPath("temp") + "/papetron";
    if (!fs.existsSync(newPath)) {
      fs.mkdir(newPath, (err) => {
        if (err) throw err;
      });
    }
    tray = new Tray(path.join(__dirname, "/icon.png"));
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: function () {
        createWindow();
      },
    },
    {
      label: "Start",
      click: function () {
        papetronStart();
      },
    },
    {
      label: "Pause",
      click: function () {
        papetronStop();
      },
    },
    {
      label: "Next Wallpaper",
      click: function () {
        changeWallpaper();
      },
    },
    {
      label: "Quit",
      click: function () {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);
  tray.setToolTip("Papetron");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    createWindow();
  });

  storage.set("isRunning", false);

  createWindow();
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin" && storage.get("keepRunning") === false) {
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
  const isRunning = storage.get("isRunning");
  instanceFileList = [];
  setUserSettings(formData);
  if (isRunning) {
    papetronStop();
    papetronStart();
  }
});

ipcMain.on("papetron:start", function (event) {
  papetronStart();
});

ipcMain.on("papetron:stop", function (event) {
  papetronStop();
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

ipcMain.on("wallpaper:cycle", function (event) {
  changeWallpaper();
});
