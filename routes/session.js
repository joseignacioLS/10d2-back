import express from "express";
import { createSession, getRecentSessions, getSessionById } from "../controllers/session.js";
import { authenticateToken } from "../middleware/auth.js";

export const router = express.Router();

router.get("/:sessionId", getSessionById);

router.get("/last/:n", getRecentSessions);

router.post("/", authenticateToken, createSession);

