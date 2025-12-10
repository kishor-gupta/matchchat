import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import socketIOOptions from "./socket.io/option";
import { registerRandomChatNamespace } from "./chat/random-chat/index";
import tryEnv from "./util/tryEnv";

const PORT = tryEnv("PORT", "3000");
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
