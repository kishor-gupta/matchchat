import express from "express";
import { createServer } from "node:http";
import socketIOOptions from "./socket.io/option";
import { Server } from "socket.io";
import dotenv from "dotenv";
import tryEnv from "./util/tryEnv";
dotenv.config();

const PORT = tryEnv("PORT", "8888");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, socketIOOptions);


io.on("connection", (socket) => {
  // ...
});

httpServer.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
