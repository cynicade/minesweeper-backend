import { Socket } from "socket.io";
import { makeGrid } from "../utils/makeGrid";

export function handleConnection(socket: Socket): void {
  console.log(socket.id);
  socket.on("request_grid", (diff) => {
    socket.emit("new_grid", makeGrid(diff));
  });
  socket.on("disconnect", (_reason) => {
     console.log("disconnected", _reason)
    // clear socket stuff from db
  });
}
