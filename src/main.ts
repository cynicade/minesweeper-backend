import "dotenv/config";
import { io } from "./socket/index";

io.listen(Number(process.env.PORT));
