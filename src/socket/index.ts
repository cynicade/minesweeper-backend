import { Socket } from "socket.io";
import { makeGrid } from "../utils";
import {
  addMemberToRoom,
  createRoom,
  getAllMemberData,
  getGrid,
  incrMemberScore,
  removeMemberFromRoom,
  resetReadyAndGrid,
  toggleMemberReady,
} from "../redis";
import { Difficulty } from "../types";

export function handleConnection(socket: Socket): void {
  console.log(socket.id);
  socket.on("request_grid", async (roomId: string) => {
    socket.emit("new_grid", await getGrid(roomId));
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
    await toggleMemberReady(roomId, socket.id);
    const members = await getAllMemberData(roomId);
    socket.to(roomId).emit("member_state_changed", members); // emit to all sockets in the (socket) room except the sender
    socket.emit("member_state_changed", members); // emit to the sender
  });

  socket.on("player_solved_grid", async (roomId: string) => {
    // give sender a point
    await incrMemberScore(roomId, socket.id);
    // set all members to not ready and get a new grid
    await resetReadyAndGrid(roomId);
    // give all members a new grid
    const grid = await getGrid(roomId);
    socket.to(roomId).emit("new_grid", grid);
    socket.emit("new_grid", grid);
  });

  socket.on("leave_room", async (roomId: string) => {
    await removeMemberFromRoom(roomId, socket.id);
    const members = await getAllMemberData(roomId);
    // the sender has disconnected and is automatically removed from the (socket) room
    socket.to(roomId).emit("member_state_changed", members);
  });
}
