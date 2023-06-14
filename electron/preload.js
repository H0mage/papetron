const { contextBridge, ipcRenderer } = require("electron");
const Store = require("electron-store");
window.ipcRenderer = ipcRenderer;

const store = new Store();

// To Persist settings
contextBridge.exposeInMainWorld("Settings", {
  directories: () => store.get("directories"),
  timeInterval: () => store.get("timeInterval"),
  isCollage: () => store.get("isCollage"),
  syncDisplays: () => store.get("syncDisplays"),
  windowSize: () => store.get("windowSize"),
  maxCollage: () => store.get("maxCollage"),
  keepRunning: () => store.get("keepRunning"),
  settings: () => ipcRenderer.invoke("settings").then((result) => result),
  saveSettings: (formData) => ipcRenderer.send("save:settings", formData),
  settingsOpen: (value) => ipcRenderer.send("settings:open", value),
});

// Wallpaper actions
contextBridge.exposeInMainWorld("Papetron", {
  start: () => {
    ipcRenderer.send("papetron:start");
    store.set("isRunning", true);
  },
  stop: () => {
    ipcRenderer.send("papetron:stop");
    store.set("isRunning", false);
  },
  isRunning: () => store.get("isRunning"),
});
