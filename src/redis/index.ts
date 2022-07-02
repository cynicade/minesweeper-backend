import { createClient } from "redis";
import { Difficulty, IMember } from "../types";
import { makeId, makeRandomName } from "../utils";

export const client: ReturnType<typeof createClient> = createClient({
  url: process.env.REDIS_URL,
  // password: process.env.REDIS_PASSWORD,
});

client.on("error", (err) => console.error("redis client error", err));

export async function createRoom(diff: Difficulty): Promise<string> {
  const id = makeId(5);
  await client.json.set(`room:${id}`, ".", {
    difficulty: diff,
    members: [],
  });
  return id;
}

export async function addMemberToRoom(
  roomId: string,
  socketId: string
): Promise<string> {
  const name: string = makeRandomName();
  await client.json.arrAppend(`room:${roomId}`, ".members", {
    name,
    socketId,
    score: 0,
    ready: false,
  });
  return name;
}

// TODO: make proper type for return data
export async function getAllMemberData(
  roomId: string
): Promise<Array<IMember>> {
  return (await client.json.get(`room:${roomId}`, {
    path: ".members",
  })) as unknown as Array<IMember>; // this is horrible, but the Redis library for node is horribly typed :')
}

export async function checkMembersReady(roomId: string): Promise<boolean> {
  const members = await getAllMemberData(roomId);
  return (
    members.filter((member: IMember) => member.ready).length === members.length
  );
}

export async function incrMemberScore(
  roomId: string,
  socketId: string
): Promise<void> {
  const idxDirty: number | number[] = await client.json.arrIndex(
    `room:${roomId}`,
    ".members",
    socketId
  );
  let idx: number;
  typeof idxDirty === "number" ? (idx = idxDirty) : (idx = idxDirty[0]);
  await client.json.numIncrBy(`room:${roomId}`, `.members[${idx}].score`, 1);
}

export async function setMemeberReady(
  roomId: string,
  socketId: string,
  ready: boolean
): Promise<void> {
  const idxDirty: number | number[] = await client.json.arrIndex(
    `room:${roomId}`,
    ".members",
    socketId
  );
  let idx: number;
  const flag = ready ? 1 : -1;
  typeof idxDirty === "number" ? (idx = idxDirty) : (idx = idxDirty[0]);
  await client.json.numIncrBy(`room:${roomId}`, `.members[${idx}].ready`, flag);
}

export async function removeMemberFromRoom(roomId: string, socketId: string) {
  const members = await getAllMemberData(roomId);
  // find the index of the member who left by their socket id
  const idx = members.findIndex(
    (member: IMember) => member.socketId === socketId
  );
  if (idx !== -1) {
    // if found, remove the member from the room
    await client.json.arrPop(`room:${roomId}`, ".members", idx);
    if ((await client.json.arrLen(`room:${roomId}`, ".members")) === 0)
      // if this was the last member in the room (meaning the room is now empty), delete the room
      await client.json.del(`room:${roomId}`);
  }
}

export async function replaceMemberArray(
  roomId: string,
  members: Array<IMember>
): Promise<Array<IMember>> {
  const difficulty = (await client.json.get(`room:${roomId}`, {
    path: ".difficulty",
  })) as unknown as Difficulty; // this is horrible, but the Redis library for node is horribly typed :')

  const updatedObject = JSON.stringify({ difficulty, members });

  // Doesn't work otherwise...
  await client.json.set(`room:${roomId}`, ".", JSON.parse(updatedObject));
  return await getAllMemberData(roomId);
}

export async function roomExists(roomId: string): Promise<boolean> {
  // .exists() returns 0 or 1, so coercing into a boolean makes it True|False
  return Boolean(await client.exists(`room:${roomId}`));
}
