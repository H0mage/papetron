import "./App.css";
import React, { useState, useEffect } from "react";
// const { ipcRenderer } = window.require("electron");
// import { ipcRenderer } from "electron";
// import { setUserSettings } from "./settings";

function App() {
  const [directories, setDirectories] = useState([]);
  const [timeInterval, setTimeInterval] = useState("");
  const [isCollage, setIsCollage] = useState(false);
  const [syncDisplays, setSyncDisplays] = useState(false);

  useEffect(() => {
    console.log(window.Settings);
    if (window) {
      setDirectories(window.Settings.directories);
      setTimeInterval(window.Settings.timeInterval);
      setIsCollage(window.Settings.isCollage);
      setSyncDisplays(window.Settings.syncDisplays);
    }
  }, []);

  useEffect(() => {
    console.log(window.Settings.directories);
    console.log(window.Settings.timeInterval);
    console.log(window.Settings.isCollage);
    console.log(window.Settings.syncDisplays);
  });

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

  return (
    <div className="App">
      <header className="App-header">
        <div className="Title">Papetron</div>
      </header>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          name="directoryPicker"
          directory=""
          webkitdirectory=""
          multiple=""
          onChange={handleDirectoryChange}
          style={{ color: "rgba(0, 0, 0, 0)" }}
        />
        <p>Selected Directories: </p>
        <div>
          {directories
            ? directories.map((directory, index) => (
                <li key={index} name={index} className="directoryItem">
                  {directory}{" "}
                  <span onClick={() => removeDirectoryHandler(index)}>X</span>
                </li>
              ))
            : ""}
        </div>
        <label>
          Time Interval:
          <select
            name="timeInterval"
            defaultValue="30000"
            onChange={handleSelect}
            value={timeInterval}
          >
            <option value="30000">30 Seconds</option>
            <option value="60000">1 Minute</option>
            <option value="300000">5 minutes</option>
            <option value="600000">10 minutes</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            name="isCollage"
            onChange={handleCheck}
            checked={isCollage}
          />
          Collage Images?
        </label>
        <label>
          <input
            type="checkbox"
            name="syncDisplays"
            onChange={handleCheck}
            checked={syncDisplays}
          />
          Sync Displays?
        </label>
        <button type="submit" value="Submit">
          Save Settings
        </button>
      </form>
    </div>
  );
}

export default App;
