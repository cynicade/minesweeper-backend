import { Socket } from "socket.io";
import { makeGrid } from "../utils";
import { addMemberToRoom, createRoom, removeMemberFromRoom } from "../redis";
import { Difficulty } from "../types";

export function handleConnection(socket: Socket): void {
  console.log(socket.id);
  socket.on("request_grid", (diff) => {
    socket.emit("new_grid", makeGrid(diff));
  });
  socket.on("request_new_room", (diff: Difficulty) => {
    createRoom(diff).then((roomId) => {
      addMemberToRoom(roomId, socket.id).then(() =>
        socket.emit("new_room", roomId)
      );
    });
  });
  socket.on("join_room", (roomId: string) => {
    addMemberToRoom(roomId, socket.id).then(() =>
      socket.emit("new_room", roomId)
    );
  });
  socket.on("leave_room", (roomId: string) => {
    removeMemberFromRoom(roomId, socket.id);
  });
  socket.on("test", (msg: string) => {
    console.log(msg);
  });
}
