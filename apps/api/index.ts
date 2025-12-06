import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import socketIOOptions from "./socket.io/option";
import { registerRandomChatNamespace } from "./chat/random-chat/index";
import dotenv from "dotenv";
dotenv.config();

const PORT = Number(process.env.PORT) || 8888;
const app = express();
const server = http.createServer(app);
const io = new Server(server, socketIOOptions);

app.get("/health", (req: express.Request, res: express.Response) => {
  res.status(200).send("OK");
});

// Namespaces
registerRandomChatNamespace(io);

server.listen(PORT, () => {
  console.log(`API server is running on port ${PORT}`);
});

export default app;
