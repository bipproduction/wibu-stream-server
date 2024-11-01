import { ExpressPeerServer } from "peer";
import express from "express";

const PORT = 3033
const app = express();

app.get("/", (req, res, next) => res.send("wibu stream ok"));

const server = app.listen(PORT, () =>
  console.log(`Server started on port ${PORT} `)
);

const peerServer = ExpressPeerServer(server, {
  path: "/stream"
});

app.use("/wibu", peerServer);

peerServer.on("connection", (client) => {
  console.log("Client connected: " + client.getId());
});

peerServer.on("disconnect", (client) => {
  console.log("Client disconnected: " + client.getId());
});

peerServer.on("error", (err) => {
  console.log("Peer server error:", err);
});

peerServer.on("message", (message) => {
  console.log("Peer server message:", message.getId());
});
