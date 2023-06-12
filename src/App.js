import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import Icon from "@mdi/react";
import {
  mdiMenuDown,
  mdiMenuUp,
  mdiDeleteCircle,
  mdiFolderPlus,
} from "@mdi/js";
// const { ipcRenderer } = window.require("electron");
// import { ipcRenderer } from "electron";
// import { setUserSettings } from "./settings";

function App() {
  const [directories, setDirectories] = useState([]);
  const [timeInterval, setTimeInterval] = useState("");
  const [isCollage, setIsCollage] = useState(false);
  const [syncDisplays, setSyncDisplays] = useState(false);
  const [processStart, setProcessStart] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const hiddenFileInput = useRef(null);

  useEffect(() => {
    console.log(window.Settings);
    if (window) {
      setDirectories(window.Settings.directories);
      setTimeInterval(window.Settings.timeInterval);
      setIsCollage(window.Settings.isCollage);
      setSyncDisplays(window.Settings.syncDisplays);
    }
  }, []);

  const handleDirectoryChange = (event) => {
    const directory = event.target.files[0].path.split("\\");
    console.log(directory);
    directory.pop();
    const finalPath = directory.join("\\");
    event.target.value = null;
    event.target.files = null;
    setDirectories([...directories, finalPath]);
  };

  const handleSelect = (event) => {
    setTimeInterval(event.target.value);
  };

  const handleCheck = (event) => {
    console.log(event.target.value);
    console.log(event.target.name);
    console.log(event.target.checked);
    if (event.target.name === "isCollage") {
      setIsCollage(event.target.checked);
    } else if (event.target.name === "syncDisplays") {
      setSyncDisplays(event.target.checked);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(event);
    console.log(directories, timeInterval, isCollage, syncDisplays);
    const formData = {
      directories,
      timeInterval,
      isCollage,
      syncDisplays,
    };
    window.Settings.saveSettings(formData);
    // setUserSettings(formData);
  };

  const removeDirectoryHandler = (index) => {
    console.log("you want to delete me", index);
    const directoriesCopy = directories.slice();
    directoriesCopy.splice(index, 1);
    setDirectories(directoriesCopy);
  };

  const startPapetron = (event) => {
    console.log("start", event);
    event.preventDefault();
    setProcessStart(true);
    window.Papetron.start();
  };

  const stopPapetron = (event) => {
    console.log("stop", event);
    event.preventDefault();
    setProcessStart(false);
    window.Papetron.stop();
  };

  const handleMenu = (event) => {
    console.log("menu", event);
    setSettingsOpen(!settingsOpen);
  };

  const triggerDirectorySearch = () => {
    hiddenFileInput.current.click();
  };

  return (
    <div className="container">
      <div className="settings-container">
        <div className="settings-title">
          <div className="title">Settings:</div>
          <Icon
            path={settingsOpen ? mdiMenuUp : mdiMenuDown}
            size={"2rem"}
            onClick={handleMenu}
            className="collapse-arrow"
          />
        </div>
        {settingsOpen && (
          <form onSubmit={handleSubmit} className="form-container">
            <div className="directories-container">
              <label>Image Directories:</label>
              <input
                type="file"
                name="directoryPicker"
                directory=""
                webkitdirectory=""
                multiple=""
                onChange={handleDirectoryChange}
                style={{ color: "rgba(0, 0, 0, 0)", display: "none" }}
                ref={hiddenFileInput}
              />
              <div className="selected-directories">
                {directories
                  ? directories.map((directory, index) => (
                      <li key={index} name={index} className="directory-item">
                        {directory}
                        <Icon
                          path={mdiDeleteCircle}
                          size={"1.5rem"}
                          onClick={() => removeDirectoryHandler(index)}
                          className="delete-icon"
                        />
                      </li>
                    ))
                  : ""}
                <li key={"add"} name={"add"} className="add-item">
                  <Icon
                    path={mdiFolderPlus}
                    size={"1.5rem"}
                    onClick={triggerDirectorySearch}
                    className="add-icon"
                  />
                </li>
              </div>
            </div>

            <div className="form-item">
              <label>
                Time Interval:
                <select
                  name="timeInterval"
                  defaultValue="30000"
                  onChange={handleSelect}
                  value={timeInterval}
                >
                  <option value="5000">5 Seconds</option>
                  <option value="10000">10 Seconds</option>
                  <option value="30000">30 Seconds</option>
                  <option value="60000">1 Minute</option>
                  <option value="300000">5 minutes</option>
                  <option value="600000">10 minutes</option>
                </select>
              </label>
            </div>
            <div className="form-item">
              <label>
                <input
                  type="checkbox"
                  name="isCollage"
                  onChange={handleCheck}
                  checked={isCollage}
                />
                Collage Images?
              </label>
            </div>
            <div className="form-item">
              <label>
                <input
                  type="checkbox"
                  name="syncDisplays"
                  onChange={handleCheck}
                  checked={syncDisplays}
                />
                Sync Displays?
              </label>
            </div>
            <button type="submit" value="Submit" className="button-save">
              Save Settings
            </button>
          </form>
        )}
      </div>
      <div className="papetron-controls">
        <button
          type="start"
          value="start"
          name="start-button"
          onClick={startPapetron}
          disabled={processStart}
          className={processStart ? "button-running" : "button-start"}
        >
          {processStart ? "Running" : "Start"}
        </button>
        <button
          type="stop"
          value="stop"
          name="stop-button"
          onClick={stopPapetron}
          disabled={!processStart}
          className={!processStart ? "button-disabled" : "button-stop"}
        >
          Stop
        </button>
      </div>
    </div>
  );
}

export default App;
