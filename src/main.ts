import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { handleConnection } from "./socket/index";
import { client } from "./redis";
import { router } from "./routes";

const app = express();
const allowOrigin = (): string =>
  process.env.NODE_ENV === "dev"
    ? "http://localhost:3000"
    : "https://cynicade.xyz/minesweeper";

const socketPath = (): string =>
  process.env.NODE_ENV === "dev" ? "/socket" : "/minesweeper/api/socket";

app.use(
  cors({
    origin: allowOrigin(),
  })
);

app.use("/api", router);

const httpServer = createServer(app);
httpServer.listen(process.env.PORT, () => {
  console.log("listening on", httpServer.address());
});

export const io = new Server(httpServer, {
  path: socketPath(),
  cors: {
    origin: allowOrigin(),
  },
});

// redis connection
client.connect();
// socket connection
io.on("connection", handleConnection);
