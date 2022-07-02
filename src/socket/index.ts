import { Socket } from "socket.io";
import { makeGrid } from "../utils";
import {
  addMemberToRoom,
  createRoom,
  getAllMemberData,
  removeMemberFromRoom,
  replaceMemberArray,
} from "../redis";
import { Difficulty } from "../types";

export function handleConnection(socket: Socket): void {
  console.log(socket.id);
  socket.on("request_grid", (diff) => {
    socket.emit("new_grid", makeGrid(diff));
  });

  socket.on("request_new_room", async (diff: Difficulty) => {
    // TODO: maybe refactor so that this only creates a new room and sends back the room id
    // and use the "join_room" handler to actually join the room

    const roomId = await createRoom(diff); // create a new room in the DB
    await addMemberToRoom(roomId, socket.id); // add sender to the room in the DB
    socket.join(roomId); // add sender to the (socket) room
    socket.emit("new_room", roomId); // send the created room's id
    const members = await getAllMemberData(roomId);
    socket.emit("member_state_changed", members);
  });

  socket.on("join_room", async (roomId: string) => {
    await addMemberToRoom(roomId, socket.id);
    socket.join(roomId);
    socket.emit("new_room", roomId);
    const members = await getAllMemberData(roomId);
    socket.to(roomId).emit("member_state_changed", members); // emit to all sockets in the (socket) room except the sender
    socket.emit("member_state_changed", members); // emit to the sender
  });

  socket.on("player_toggle_ready", async (roomId: string) => {
    const members = await getAllMemberData(roomId);
    const updatedMembers = members.map((member) => {
      if (member.socketId === socket.id)
        return { ...member, ready: !member.ready };
      else return member;
    });

    const membersAfterReplace = await replaceMemberArray(
      roomId,
      updatedMembers
    );
    socket.to(roomId).emit("member_state_changed", membersAfterReplace); // emit to all sockets in the (socket) room except the sender
    socket.emit("member_state_changed", membersAfterReplace); // emit to the sender
  });

  socket.on("leave_room", async (roomId: string) => {
    await removeMemberFromRoom(roomId, socket.id);
    const members = await getAllMemberData(roomId);
    // the sender has disconnected and is automatically removed from the (socket) room
    socket.to(roomId).emit("member_state_changed", members);
  });
}
