import express from "express";
import { annotateSession, createSession, getRecentSessions, getSessionById } from "../controllers/session.js";
import { authenticateToken } from "../middleware/auth.js";

export const router = express.Router();

router.get("/:sessionId", getSessionById);
router.get("/last/:n", getRecentSessions);
router.post("/", authenticateToken, createSession);
router.post("/annotate", authenticateToken, annotateSession);

