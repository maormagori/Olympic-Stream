const { google } = require("googleapis");
require("dotenv").config();
const util = require("util");
const fs = require("fs");
const { response } = require("express");
const { add } = require("date-fns");
const { startOBSStream, stopOBSStream } = require("./obsControls.js");

// VARS
let broadcastId;
let liveChatId;
let nextPage;
const intervalTime = 3000;
let interval;
let chatMessages = [];
const livestreamId = process.env.STREAM_ID;

const youtube = google.youtube("v3");
const OAuth2 = google.auth.OAuth2;

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectURI = "http://localhost:3000/callback";
const scope = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.force-ssl",
];

const auth = new OAuth2(clientId, clientSecret, redirectURI);

auth.on("tokens", (tokens) => {
  if (tokens.refresh_token) {
    save("./tokens.json", JSON.stringify(auth.tokens));
    console.log(tokens.refresh_token);
  }
  console.log(tokens.access_token);
});

const checkTokens = async () => {
  const tokens = await read("./tokens.json");
  if (tokens) {
    auth.setCredentials(tokens);
    console.log("tokens set");
  } else {
    console.log("no tokens set");
  }
};

const writeFilePromise = util.promisify(fs.writeFile);
const readFilePromise = util.promisify(fs.readFile);

const save = async (path, str) => {
  await writeFilePromise(path, str);
  console.log("Successfully Saved");
};

const read = async (path) => {
  const fileContents = await readFilePromise(path);
  return JSON.parse(fileContents);
};

const getCode = (res) => {
  const authUrl = auth.generateAuthUrl({ access_type: "offline", scope });
  res.redirect(authUrl);
};

const getTokensWithCode = async (code) => {
  const credentials = await auth.getToken(code);
  authorize(credentials);
};

const authorize = ({ tokens }) => {
  auth.setCredentials(tokens);
  console.log("Successfully set credentials");
  console.log("tokens:", tokens);
  save("./tokens.json", JSON.stringify(tokens));
};

const startStream = async () => {
  try {
    console.log("Starting stream...");
    let response = await startBroadcast();

    broadcastId = response.data.id;
    liveChatId = response.data.snippet.liveChatId;
    console.log("broadcast data:");
    console.log(response.data);

    await _bindStreamToBroadcast();

    await startOBSStream();

    console.log("Stream started!");
    console.log("Chat ID Found:", liveChatId);
    startTrackingChat();
  } catch (e) {
    console.log(e);
  }
};

const startBroadcast = () => {
  return youtube.liveBroadcasts.insert({
    auth,
    part: ["id", "snippet", "contentDetails", "status"],
    resource: {
      snippet: {
        title: "Live from Maor's Receiver!",
        scheduledStartTime: new Date(),
      },
      status: {
        privacyStatus: "unlisted",
        selfDeclaredMadeForKids: false,
      },
      contentDetails: {
        enableAutoStop: true,
        enableAutoStart: true,
      },
    },
  });
};

const startLivestream = () => {
  return youtube.liveStreams.insert({
    auth,
    part: ["id", "snippet", "cdn", "contentDetails", "status"],
    resource: {
      snippet: {
        title: "Live from Maor's Receiver!",
      },
      cdn: {
        frameRate: "30fps",
        ingestionType: "rtmp",
        resolution: "1080p",
      },
    },
  });
};

const _bindStreamToBroadcast = async () => {
  await youtube.liveBroadcasts.bind({
    auth,
    id: broadcastId,
    part: ["id", "status"],
    streamId: livestreamId,
  });
};

const stopStream = async () => {
  await stopOBSStream();

  let response = await youtube.liveBroadcasts.delete({
    auth,
    id: broadcastId,
  });

  console.log(response);
  broadcastId = "";
  liveChatId = "";
  stopTrackingChat();
};

const findActiveChat = async () => {
  const response = await youtube.liveBroadcasts.list({
    auth,
    part: "snippet",
    mine: "true",
  });

  if (response.data.items.length > 0) {
    const latestChat = response.data.items[0];
    liveChatId = latestChat.snippet.liveChatId;
    console.log("Chat ID Found:", liveChatId);
    startTrackingChat();
  } else {
    console.log("No Active Chats!");
  }
};

const getChatMessages = async () => {
  try {
    const response = await youtube.liveChatMessages.list({
      auth,
      part: "snippet",
      liveChatId,
      pageToken: nextPage,
    });

    const { data } = response;
    const newMessages = data.items;
    chatMessages = [...newMessages];
    nextPage = data.nextPageToken;
    console.log("Total Chat Messages:", chatMessages.length);
  } catch (e) {
    stopTrackingChat();
  }
};

const startTrackingChat = () => {
  interval = setInterval(getChatMessages, intervalTime);
};

const stopTrackingChat = () => {
  clearInterval(interval);
};

const insertMessage = (messageText) => {
  youtube.liveChatMessages.insert(
    {
      auth,
      part: "snippet",
      resource: {
        snippet: {
          type: "textMessageEvent",
          liveChatId,
          textMessageDetails: {
            messageText,
          },
        },
      },
    },
    () => {}
  );
};

checkTokens();

module.exports = {
  getCode,
  getTokensWithCode,
  findActiveChat,
  startStream,
  stopStream,
};
