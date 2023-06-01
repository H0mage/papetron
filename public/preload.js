const { contextBridge, ipcRenderer } = require("electron");
const Store = require("electron-store");

const store = new Store();

const { setUserSettings, getUserSettings } = require("../src/settings");

const settings = getUserSettings();
console.log("settings", settings);

contextBridge.exposeInMainWorld("Settings", {
  directories: () => store.get("directories"),
  timeInterval: () => store.get("timeInterval"),
  isCollage: () => store.get("isCollage"),
  syncDisplays: () => store.get("syncDisplays"),
  settings: () => ipcRenderer.invoke("settings").then((result) => result),
  saveSettings: (formData) => ipcRenderer.send("save:settings", formData),
});
