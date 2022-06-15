import { Router } from "express";
import { addMemberToRoom, getAllMemberData, roomExists } from "../redis";

export const router = Router();

router.get("/checkRoom/:roomId", (req, res) => {
  roomExists(req.params.roomId).then((result) => {
    if (result) res.sendStatus(200);
    else res.sendStatus(404);
  });
});

router.get("/members/:roomId", (req, res) => {
  getAllMemberData(req.params.roomId).then((result) => {
    res.send(JSON.stringify(result)).status(200);
  });
});

router.post("/add/:roomId", (req, res) => {
  addMemberToRoom(req.params.roomId, "testing").then(() => res.sendStatus(200));
});
