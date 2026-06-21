import cors from "cors";
import express from "express";

import "dotenv/config";

import { router as announcementRouter } from "./routes/announcement.js";
import { router as authRouter } from "./routes/auth.js";
import { router as campaignRouter } from "./routes/campaign.js";
import { router as characterRouter } from "./routes/character.js";
import { router as searchRouter } from "./routes/search.js";
import { router as sessionRouter } from "./routes/session.js";
import { router as userRouter } from "./routes/user.js";

const server = express();
const router = express.Router();


const origin =
  process.env.CORS_ACCEPTED === "*"
    ? "*"
    : process.env.CORS_ACCEPTED.split(" ");

server.use(
  cors({
    origin,
    credentials: true,
  })
);

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

//JWT SECRET KEY

server.use("/auth", authRouter);
server.use("/user", userRouter);
server.use("/session", sessionRouter);
server.use("/campaign", campaignRouter);
server.use("/character", characterRouter);
server.use("/search", searchRouter);
server.use("/announcement", announcementRouter);

server.use(router);

router.get("/", async (req, res, next) => {
  try {
    res.status(200).json({
      status: 200,
      message: "",
      data: [],
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

server.use((req, res) => {
  res.status(404).send("Route not found");
});

server.listen((process.env.PORT ?? 3000), () => {
  console.log("server up at " + (process.env.PORT ?? 3000));
});
