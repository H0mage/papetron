const { app, BrowserWindow, ipcMain } = require("electron");
const Store = require("electron-store");
const path = require("path");
const url = require("url");

let mainWindow;

const defaults = {
  timeInterval: 30000,
  isCollage: true,
  synchronizeDisplays: false,
  directories: [],
};

const store = new Store({ defaults });

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.on("ready", function () {
  console.log(store.get("timeInterval"));
  createWindow();
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("form:submit", function (event, formValues) {
  // Access the form values here and perform desired actions
  console.log(formValues);
  // You can send the values to the main process or perform any other operations
});
