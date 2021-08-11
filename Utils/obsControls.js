const OBSWebSocket = require("obs-websocket-js");

const obs = new OBSWebSocket();

const connectToOBS = async () => {
  obs
    .connect({
      address: "localhost:4444",
      password: process.env.OBS_PASSWORD,
    })
    .catch((e) => {
      console.log("OBS Connection failed!");
    });
};

connectToOBS();

const startOBSStream = async () => {
  return obs.send("StartStreaming", {});
};

const stopOBSStream = async () => {
  return obs.send("StopStreaming", {});
};

module.exports = {
  startOBSStream,
  stopOBSStream,
};
