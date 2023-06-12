const Store = require("electron-store");
const storage = new Store();

function getUserSettings() {
  const directories = storage.get("directories");
  const timeInterval = storage.get("timeInterval");
  const isCollage = storage.get("isCollage");
  const syncDisplays = storage.get("syncDisplays");
  const windowSize = storage.get("windowSize");
  const maxCollage = storage.get("maxCollage");

  if (timeInterval) {
    const userSettings = {
      directories,
      timeInterval,
      isCollage,
      syncDisplays,
      windowSize,
      maxCollage,
    };
    return userSettings;
  } else {
    const defaultSettings = {
      directories: [],
      timeInterval: 50000,
      isCollage: true,
      syncDisplays: false,
      maxCollage: 6,
    };
    storage.set("directories", defaultSettings.directories);
    storage.set("timeInterval", defaultSettings.timeInterval);
    storage.set("isCollage", defaultSettings.isCollage);
    storage.set("syncDisplays", defaultSettings.syncDisplays);
    storage.set("maxCollage", defaultSettings.maxCollage);
    return defaultSettings;
  }
}

function setUserSettings(formData) {
  storage.set("directories", formData.directories);
  storage.set("timeInterval", formData.timeInterval);
  storage.set("isCollage", formData.isCollage);
  storage.set("syncDisplays", formData.syncDisplays);
  storage.set("maxCollage", formData.maxCollage);
}

module.exports = {
  getUserSettings,
  setUserSettings,
};
