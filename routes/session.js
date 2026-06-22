import express from "express";
import { annotateSession, createSession, deleteAnnotation, editAnnotation, getRecentSessions, getSessionById } from "../controllers/session.js";
import { authenticateToken, isMemberOfCampaign } from "../middleware/auth.js";

export const router = express.Router();

router.get("/:sessionId", getSessionById);
router.get("/last/:n", getRecentSessions);
router.post("/", authenticateToken, isMemberOfCampaign, createSession);
router.post("/annotation", authenticateToken, isMemberOfCampaign, annotateSession);
router.put("/annotation/:annotationId", authenticateToken, editAnnotation);
router.delete("/annotation/:annotationId", authenticateToken, deleteAnnotation);

