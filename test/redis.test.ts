import {
  createRoom,
  addMemberToRoom,
  getAllMemberData,
  incrMemberScore,
  removeMemberFromRoom,
} from "../src/redis";

describe("create room", () => {
  it("should create a new room with random id and return it", async () => {
    const roomId = await createRoom("beginner");
  });
});
