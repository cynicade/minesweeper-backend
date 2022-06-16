import { Socket } from "socket.io";
import { makeGrid } from "../utils";
import { addMemberToRoom, createRoom, removeMemberFromRoom } from "../redis";
import { Difficulty } from "../types";

export function handleConnection(socket: Socket): void {
  console.log(socket.id);
  socket.on("request_grid", (diff) => {
    socket.emit("new_grid", makeGrid(diff));
  });
  socket.on("request_new_room", async (diff: Difficulty) => {
    const roomId = await createRoom(diff);
    await addMemberToRoom(roomId, socket.id);
    socket.emit("new_room", roomId);
  });
  socket.on("join_room", async (roomId: string) => {
    await addMemberToRoom(roomId, socket.id);
    socket.emit("new_room", roomId);
  });
  socket.on("leave_room", (roomId: string) => {
    removeMemberFromRoom(roomId, socket.id);
  });
  socket.on("test", (msg: string) => {
    console.log(msg);
  });
}
