import { Router } from "express";
import { addMemberToRoom, getAllMemberData, roomExists } from "../redis";
import { IMember } from "../types";
import { makeGrid } from "../utils";

export const router = Router();

router.get("/checkRoom/:roomId", async (req, res) => {
  const result = await roomExists(req.params.roomId);
  if (result) res.sendStatus(200);
  else res.sendStatus(404);
});

router.get("/members/:roomId", async (req, res) => {
  console.log(req.params.roomId);
  const exists = await roomExists(req.params.roomId);
  if (exists) {
    const data = await getAllMemberData(req.params.roomId);
    const membersArr: Array<IMember> = data.map((member: any) => ({
      name: member.name,
      socketId: member.socketId,
      score: member.score,
      ready: member.ready === 0 ? false : true,
    }));
    res.json({ members: membersArr }).status(200);
  } else res.sendStatus(404);
});

router.post("/grid", (req, res) => {
  // TODO: validate difficulty
  res.send(JSON.stringify({ grid: makeGrid(req.body.difficulty) })).status(200);
});

router.get("/add/:roomId", (req, res) => {
  addMemberToRoom(req.params.roomId, "testing").then(() => res.sendStatus(200));
});
