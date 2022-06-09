import { Server, Socket } from "socket.io";
import { makeGrid } from "../utils/makeGrid";

export const io = new Server({ cors: { origin: "*" } });

function handleConnection(socket: Socket): void {
  console.log(socket.id);
  socket.on("player_joined", (diff) => {
    socket.emit("new_grid", makeGrid(diff));
  });
  socket.on("disconnect", (reason) => {
    console.log("disconnected" + reason);
  });
}

io.on("connection", handleConnection);
