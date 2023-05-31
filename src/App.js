import "./App.css";
import React, { useState, useEffect } from "react";
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
    setDirectories(finalPath);
  };

  const handleSelect = (event) => {
    setTimeInterval(event.target.value);
  };

  const handleCheck = (event) => {
    console.log(event.target.value);
    console.log(event.target.name);
    if (event.target.value === "on") {
      if (event.target.name === "isCollage") {
        setIsCollage(true);
      } else if (event.target.name === "syncDisplays") {
        setSyncDisplays(true);
      }
    } else {
      if (event.target.name === "isCollage") {
        setIsCollage(false);
      } else if (event.target.name === "syncDisplays") {
        setSyncDisplays(false);
      }
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
    // setUserSettings(formData);
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
        />
        <p>Selected Directories: {directories}</p>
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
            value={isCollage ? "on" : "off"}
          />
          Collage Images?
        </label>
        <label>
          <input
            type="checkbox"
            name="syncDisplays"
            onChange={handleCheck}
            value={syncDisplays ? "on" : "off"}
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
