import { createClient } from "redis";
import { Difficulty } from "../types";
import { makeId, makeRandomName } from "../utils";

export const client = createClient({
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
    ready: 0,
  });
  return name;
}

// TODO: make proper type for return data
export async function getAllMemberData(roomId: string): Promise<any> {
  return await client.json.get(`room:${roomId}`, { path: ".members" });
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
  const idxDirty: number | number[] = await client.json.arrIndex(
    `room:${roomId}`,
    ".members",
    socketId
  );
  let idx: number;
  typeof idxDirty === "number" ? (idx = idxDirty) : (idx = idxDirty[0]);
  await client.json.arrPop(`room:${roomId}`, ".members", idx);
}

export async function roomExists(roomId: string): Promise<boolean> {
  return Boolean(await client.exists(`room:${roomId}`));
}
