import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import Icon from "@mdi/react";
import {
  mdiMenuDown,
  mdiMenuUp,
  mdiDeleteCircle,
  mdiFolderPlus,
  mdiWallpaper,
  mdiSkipForward,
  mdiPlay,
  mdiPause,
} from "@mdi/js";

function App() {
  const [directories, setDirectories] = useState([]);
  const [timeInterval, setTimeInterval] = useState("");
  const [isCollage, setIsCollage] = useState(false);
  const [syncDisplays, setSyncDisplays] = useState(false);
  const [maxCollage, setMaxCollage] = useState("");
  const [keepRunning, setKeepRunning] = useState(true);
  const [processStart, setProcessStart] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const hiddenFileInput = useRef(null);

  useEffect(() => {
    if (window) {
      setDirectories(window.Settings.directories);
      setTimeInterval(window.Settings.timeInterval);
      setIsCollage(window.Settings.isCollage);
      setSyncDisplays(window.Settings.syncDisplays);
      setMaxCollage(window.Settings.maxCollage);
      setKeepRunning(window.Settings.keepRunning || true);
      setProcessStart(window.Papetron.isRunning);
    }
  }, []);

  const handleDirectoryChange = (event) => {
    setFormChanged(true);
    event.preventDefault();
    const directory = event.target.files[0].path.split("\\");
    directory.pop();
    const finalPath = directory.join("\\");
    event.target.value = null;
    event.target.files = null;
    setDirectories([...directories, finalPath]);
    setDirectoryLoading(false);
  };

  const handleSelect = (event) => {
    setFormChanged(true);
    if (event.target.name === "timeInterval") {
      setTimeInterval(event.target.value);
    } else if (event.target.name === "maxCollage") {
      setMaxCollage(event.target.value);
    }
  };

  const handleCheck = (event) => {
    setFormChanged(true);
    if (event.target.name === "isCollage") {
      setIsCollage(event.target.checked);
    } else if (event.target.name === "syncDisplays") {
      setSyncDisplays(event.target.checked);
    } else if (event.target.name === "keepRunning") {
      setKeepRunning(event.target.checked);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = {
      directories,
      timeInterval,
      isCollage,
      syncDisplays,
      maxCollage,
      keepRunning,
    };
    await window.Settings.saveSettings(formData);

    setFormChanged(false);
  };

  const removeDirectoryHandler = (index) => {
    setFormChanged(true);
    const directoriesCopy = directories.slice();
    directoriesCopy.splice(index, 1);
    setDirectories(directoriesCopy);
  };

  const startPapetron = (event) => {
    if (!processStart) {
      event.preventDefault();
      setProcessStart(true);
      window.Papetron.start();
    }
  };

  const stopPapetron = (event) => {
    if (processStart) {
      event.preventDefault();
      setProcessStart(false);
      window.Papetron.stop();
    }
  };

  const handleMenu = (event) => {
    if (!settingsOpen) {
      window.Settings.settingsOpen(true);
    } else {
      window.Settings.settingsOpen(false);
    }
    setSettingsOpen(!settingsOpen);
  };

  const triggerDirectorySearch = () => {
    setDirectoryLoading(true);
    hiddenFileInput.current.click();
  };

  const cycleWallpaper = async (event) => {
    window.Papetron.cycleWallpaper();
  };

  // window.IPC.ipcRenderer.on("process:start", function () {
  //   setProcessStart(true);
  // });

  // window.IPC.ipcRenderer.on("process:stop", function () {
  //   setProcessStart(false);
  // });

  return (
    <div className="container">
      <div className={`settings-container ${settingsOpen && "settings-open"}`}>
        <div className="settings-title" onClick={handleMenu}>
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
              <div className="form-item">
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
              </div>
              <div className="selected-directories">
                {directories
                  ? directories.map((directory, index) => (
                      <li key={index} name={index} className="directory-item">
                        <div className="item-text">{directory}</div>
                        <Icon
                          path={mdiDeleteCircle}
                          size={"1.5rem"}
                          onClick={() => removeDirectoryHandler(index)}
                          className="delete-icon"
                        />
                      </li>
                    ))
                  : ""}
                <li
                  key={"add"}
                  name={"add"}
                  className="add-item"
                  onClick={triggerDirectorySearch}
                >
                  {directoryLoading ? (
                    <div className="add-icon">Loading...</div>
                  ) : (
                    <Icon
                      path={mdiFolderPlus}
                      size={"1.5rem"}
                      className="add-icon"
                    />
                  )}
                </li>
              </div>
            </div>
            <div className="options-container">
              <div className="form-item">
                <label>Time Interval:</label>
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
                  <option value="300000">5 Minutes</option>
                  <option value="600000">10 Minutes</option>
                  <option value="1800000">30 Minutes</option>
                  <option value="3600000">1 Hour</option>
                </select>
              </div>
              <div className="form-item">
                <label>Collage Images?</label>
                <input
                  type="checkbox"
                  name="isCollage"
                  onChange={handleCheck}
                  checked={isCollage}
                />
              </div>
              {isCollage && (
                <div className="form-item">
                  <label>Max number of images per collage?</label>
                  <select
                    name="maxCollage"
                    defaultValue="6"
                    onChange={handleSelect}
                    value={maxCollage}
                  >
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                  </select>
                </div>
              )}
              {/* <div className="form-item">
              <label>Sync Displays?</label>
              <input
                type="checkbox"
                name="syncDisplays"
                onChange={handleCheck}
                checked={syncDisplays}
              />
            </div> */}
              <div className="form-item">
                <label>Minimize to tray on close?</label>
                <input
                  type="checkbox"
                  name="keepRunning"
                  onChange={handleCheck}
                  checked={keepRunning}
                />
              </div>
              <button
                type="submit"
                value="Submit"
                className={
                  !formChanged ? "button-save-disabled" : "button-save"
                }
                disabled={!formChanged}
              >
                Save Settings
              </button>
            </div>
          </form>
        )}
      </div>
      <div className="papetron-controls">
        <button
          className="button-start"
          onClick={processStart ? stopPapetron : startPapetron}
          title={processStart ? "Pause" : "Start"}
        >
          <Icon path={processStart ? mdiPause : mdiPlay} size={"4rem"} />
        </button>
        <button
          className="next-wallpaper"
          onClick={cycleWallpaper}
          title="Next Wallpaper"
        >
          <Icon path={mdiWallpaper} size={2} />
          <Icon path={mdiSkipForward} size={2} />
        </button>
      </div>
    </div>
  );
}

export default App;
