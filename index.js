const express = require("express");
const path = require("path");
const youtubeService = require("./Utils/youtubeService");
const obsControls = require("./Utils/obsControls.js");

const server = express();

server.get("/", (req, res) =>
  res.sendFile(path.join(__dirname + "/index.html"))
);

server.get("/authorize", (request, response) => {
  console.log("/auth");
  youtubeService.getCode(response);
});

server.get("/callback", (req, response) => {
  const { code } = req.query;
  youtubeService.getTokensWithCode(code);
  response.redirect("/");
});

server.get("/find-active-chat", (req, res) => {
  youtubeService.findActiveChat();
  res.redirect("/");
});

server.get("/start-stream", async (req, res) => {
  //youtubeService.startStream();
  obsControls.startOBSStream();
  res.redirect("/");
});

server.get("/stop-stream", (req, res) => {
  //youtubeService.stopStream();
  obsControls.stopOBSStream();
  res.redirect("/");
});

server.listen(process.env.PORT, function () {
  console.log("Server is Ready");
});
